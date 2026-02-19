/**
 * Claude API analyzer — calls claude-sonnet-4-6 with the ticker context
 * and parses the structured JSON response.
 */

import Anthropic from '@anthropic-ai/sdk'
import { buildAnalysisPrompt } from './prompts'
import type { TickerContext, AgentAnalysis } from './types'

const VALID_PREDICTIONS = new Set(['up', 'down', 'sideways'])

function parseAnalysisResponse(raw: string): AgentAnalysis {
  // Strip possible markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Claude returned invalid JSON. Raw response (first 500 chars): ${cleaned.slice(0, 500)}`)
  }

  const prediction = parsed.prediction as string
  if (!VALID_PREDICTIONS.has(prediction)) {
    throw new Error(`Invalid prediction value: "${prediction}"`)
  }

  const confidence = Number(parsed.confidence)
  if (isNaN(confidence) || confidence < 0 || confidence > 100) {
    throw new Error(`Invalid confidence value: "${parsed.confidence}"`)
  }

  return {
    prediction: prediction as 'up' | 'down' | 'sideways',
    confidence: Math.round(confidence),
    summary_es: String(parsed.summary_es ?? ''),
    summary_en: String(parsed.summary_en ?? ''),
    highlights: Array.isArray(parsed.highlights)
      ? (parsed.highlights as unknown[]).map(String).slice(0, 7)
      : [],
    reasoning_es: String(parsed.reasoning_es ?? ''),
    reasoning_en: String(parsed.reasoning_en ?? ''),
    news_sources: Array.isArray(parsed.news_sources)
      ? (parsed.news_sources as Array<Record<string, string>>).map((s) => ({
          title: String(s.title ?? ''),
          url: String(s.url ?? ''),
          source: String(s.source ?? ''),
          date: String(s.date ?? ''),
        }))
      : [],
  }
}

export interface AnalyzerResult {
  analysis: AgentAnalysis
  inputTokens: number
  outputTokens: number
}

export async function analyzeWithClaude(ctx: TickerContext): Promise<AnalyzerResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = buildAnalysisPrompt(ctx)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system:
      'You are an expert financial analyst. You respond ONLY with valid JSON matching the schema provided. No markdown, no explanations outside the JSON object.',
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }

  return {
    analysis: parseAnalysisResponse(textBlock.text),
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  }
}
