/**
 * GET /api/radar/refresh  (Vercel Cron — Mon-Fri 6AM UTC)
 * Secured with Authorization: Bearer {CRON_SECRET}
 *
 * POST /api/radar/refresh  (manual trigger — authenticated user)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshRadarData } from '@/lib/radar/refresh'

export const maxDuration = 300 // 5 min — batch of ~150 tickers can take ~1 min

// ─── Cron trigger ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()

  try {
    const result = await refreshRadarData(serviceClient)
    console.log(`[radar/refresh cron] ${result.updated} updated, ${result.failed} failed`)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[radar/refresh GET] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─── Manual trigger (authenticated user) ─────────────────────────────────────

export async function POST(_request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const serviceClient = createServiceClient()

  try {
    const result = await refreshRadarData(serviceClient)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[radar/refresh POST] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
