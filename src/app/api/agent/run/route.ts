/**
 * POST /api/agent/run
 * Triggers the weekly analysis for the authenticated user's watchlist.
 *
 * GET /api/agent/run  (Vercel Cron — runs every Sunday 8PM UTC)
 * Secured with Authorization: Bearer {CRON_SECRET}
 * Analyzes all unique tickers across all users' watchlists.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runAnalysisForTickers } from '@/lib/agent/run-analysis'
import { sendWeeklyReports } from '@/lib/email/send-weekly-reports'

// ─── Manual trigger (authenticated user) ────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Get the user's watchlist tickers
  const { data: watchlist, error: watchlistError } = await supabase
    .from('watchlist')
    .select('ticker')
    .eq('user_id', user.id)

  if (watchlistError) {
    return NextResponse.json({ error: watchlistError.message }, { status: 500 })
  }

  const tickers = (watchlist ?? []).map((w) => w.ticker)

  if (tickers.length === 0) {
    return NextResponse.json({ error: 'Tu watchlist está vacío' }, { status: 400 })
  }

  // Use service client for writing to weekly_analyses (bypasses RLS)
  const serviceClient = createServiceClient()

  try {
    const result = await runAnalysisForTickers(tickers, serviceClient)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[agent/run POST] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─── Cron trigger (Vercel Cron — all users' tickers) ────────────────────────

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()

  // Collect all unique tickers across all watchlists
  const { data: allTickers, error } = await serviceClient
    .from('watchlist')
    .select('ticker')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const uniqueTickers = Array.from(new Set((allTickers ?? []).map((w) => w.ticker)))

  if (uniqueTickers.length === 0) {
    return NextResponse.json({ message: 'No tickers to analyze', weekStart: '' })
  }

  try {
    const result = await runAnalysisForTickers(uniqueTickers, serviceClient)
    console.log(`[agent/cron] Run complete: ${result.successful} ok, ${result.failed} failed, ${result.skipped} skipped`)

    let emailResult = { sent: 0, failed: 0, skipped: 0 }
    if (result.successful > 0) {
      emailResult = await sendWeeklyReports(serviceClient)
      console.log(`[agent/cron] Emails: ${emailResult.sent} enviados, ${emailResult.failed} fallidos, ${emailResult.skipped} omitidos`)
    }

    return NextResponse.json({ ...result, emails: emailResult })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[agent/cron GET] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
