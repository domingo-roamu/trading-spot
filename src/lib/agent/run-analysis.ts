/**
 * Orchestrator: runs the full analysis pipeline for a list of tickers.
 * - Fetches shared market news once
 * - Processes each ticker sequentially (to respect Finnhub rate limits)
 * - Skips tickers with fresh analysis (< 3 days old)
 * - Saves results to weekly_analyses via upsert
 * - Logs run to report_generations
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { fetchMarketNews } from './finnhub'
import { buildTickerContext } from './context-builder'
import { analyzeWithClaude } from './analyzer'
import { getWeekStart } from '@/lib/utils'
import type { Database } from '@/types/database'
import type { RunAnalysisResult, TickerRunResult } from './types'

const FRESH_THRESHOLD_DAYS = 3

// claude-sonnet-4-6 pricing (USD per token)
const COST_PER_INPUT_TOKEN  = 3  / 1_000_000   // $3  per 1M input tokens
const COST_PER_OUTPUT_TOKEN = 15 / 1_000_000   // $15 per 1M output tokens

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

async function hasRecentAnalysis(
  supabase: SupabaseClient<Database>,
  ticker: string,
  weekStart: string
): Promise<boolean> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - FRESH_THRESHOLD_DAYS)

  const { data } = await supabase
    .from('weekly_analyses')
    .select('generated_at')
    .eq('ticker', ticker)
    .eq('week_start', weekStart)
    .single()

  if (!data) return false

  const generatedAt = new Date(data.generated_at)
  return generatedAt >= cutoff
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runAnalysisForTickers(
  tickers: string[],
  supabase: SupabaseClient<Database>
): Promise<RunAnalysisResult> {
  const startTime = Date.now()
  const weekStart = getWeekStart().toISOString().split('T')[0]
  const results: TickerRunResult[] = []
  let totalInputTokens  = 0
  let totalOutputTokens = 0

  // Log start of run
  const { data: runLog } = await supabase
    .from('report_generations')
    .insert({
      week_start: weekStart,
      total_instruments: tickers.length,
      successful_analyses: 0,
      failed_analyses: 0,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  const runId = runLog?.id ?? null

  // Fetch shared market news once (used for all tickers)
  let marketNews: Awaited<ReturnType<typeof fetchMarketNews>> = []
  try {
    marketNews = await fetchMarketNews()
  } catch (err) {
    console.warn('[agent] Could not fetch market news:', err)
    // Non-fatal: continue without macro news
  }

  // Process each ticker
  for (const ticker of tickers) {
    try {
      // Skip if fresh analysis exists
      const fresh = await hasRecentAnalysis(supabase, ticker, weekStart)
      if (fresh) {
        results.push({ ticker, status: 'skipped', reason: 'análisis reciente existe' })
        continue
      }

      // Build context from all data sources
      const context = await buildTickerContext(ticker, weekStart, marketNews)

      // Call Claude
      const { analysis, inputTokens, outputTokens } = await analyzeWithClaude(context)
      totalInputTokens  += inputTokens
      totalOutputTokens += outputTokens

      // Save to DB (upsert — one analysis per ticker per week, shared across users)
      const { error: upsertError } = await supabase
        .from('weekly_analyses')
        .upsert(
          {
            ticker,
            week_start: weekStart,
            price_current: context.currentPrice,
            price_week_ago: context.priceWeekAgo,
            price_change_pct: context.priceChangePct,
            predicted_direction: analysis.prediction,
            confidence_score: analysis.confidence,
            confidence_level: getConfidenceLevel(analysis.confidence),
            summary_es: analysis.summary_es,
            summary_en: analysis.summary_en,
            highlights: analysis.highlights,
            reasoning_es: analysis.reasoning_es,
            reasoning_en: analysis.reasoning_en,
            news_sources: analysis.news_sources,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'ticker,week_start' }
        )

      if (upsertError) {
        throw new Error(`DB upsert failed: ${upsertError.message}`)
      }

      results.push({ ticker, status: 'success' })
      console.log(`[agent] ✓ ${ticker} — ${analysis.prediction} (${analysis.confidence}%)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ ticker, status: 'error', reason: msg })
      console.error(`[agent] ✗ ${ticker} — ${msg}`)
    }

    // Respect Finnhub free tier: ~1 req/sec per call, 3 calls/ticker
    await sleep(1200)
  }

  const durationMs = Date.now() - startTime
  const successful = results.filter((r) => r.status === 'success').length
  const failed = results.filter((r) => r.status === 'error').length
  const skipped = results.filter((r) => r.status === 'skipped').length

  // Update run log with cost data
  const estimatedCostUsd =
    totalInputTokens * COST_PER_INPUT_TOKEN + totalOutputTokens * COST_PER_OUTPUT_TOKEN

  if (runId) {
    await supabase
      .from('report_generations')
      .update({
        successful_analyses: successful,
        failed_analyses: failed,
        completed_at: new Date().toISOString(),
        duration_seconds: Math.round(durationMs / 1000),
        api_calls: tickers.length * 4, // price + company news + financials + earnings
        estimated_cost_usd: parseFloat(estimatedCostUsd.toFixed(6)),
      })
      .eq('id', runId)
  }

  console.log(
    `[agent] Tokens — input: ${totalInputTokens}, output: ${totalOutputTokens}, ` +
    `cost: $${estimatedCostUsd.toFixed(4)}`
  )

  return {
    weekStart,
    results,
    successful,
    failed,
    skipped,
    durationMs,
  }
}
