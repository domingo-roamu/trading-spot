/**
 * GET /api/radar/candles?ticker=AAPL&range=1M
 * Returns OHLCV candle data from Finnhub for charting.
 *
 * Ranges: 1W, 1M, 3M, 1Y, 5Y
 */

import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_BASE = 'https://finnhub.io/api/v1'

type Range = '1W' | '1M' | '3M' | '1Y' | '5Y'

const RANGE_CONFIG: Record<Range, { days: number; resolution: string }> = {
  '1W': { days: 7, resolution: '15' },      // 15-min candles for 1 week
  '1M': { days: 30, resolution: '60' },      // 1-hour candles for 1 month
  '3M': { days: 90, resolution: 'D' },       // daily candles for 3 months
  '1Y': { days: 365, resolution: 'D' },      // daily candles for 1 year
  '5Y': { days: 1825, resolution: 'W' },     // weekly candles for 5 years
}

const VALID_RANGES = new Set(Object.keys(RANGE_CONFIG))

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  const range = searchParams.get('range')?.toUpperCase() as Range | undefined

  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })
  }
  if (!range || !VALID_RANGES.has(range)) {
    return NextResponse.json({ error: 'Invalid range. Use: 1W, 1M, 3M, 1Y, 5Y' }, { status: 400 })
  }

  const key = process.env.FINNHUB_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY not configured' }, { status: 500 })
  }

  const { days, resolution } = RANGE_CONFIG[range]
  const now = Math.floor(Date.now() / 1000)
  const from = now - days * 86400

  try {
    const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=${resolution}&from=${from}&to=${now}&token=${key}`
    const res = await fetch(url, { next: { revalidate: 0 } })

    if (!res.ok) {
      return NextResponse.json({ error: `Finnhub error: HTTP ${res.status}` }, { status: 502 })
    }

    const data = await res.json()

    // Finnhub returns { s: "no_data" } when no data is available
    if (data.s === 'no_data' || !data.c) {
      return NextResponse.json({ candles: [], ticker, range })
    }

    // Transform to array of candle objects
    const candles = data.t.map((time: number, i: number) => ({
      time,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }))

    return NextResponse.json({ candles, ticker, range })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[radar/candles] Error fetching ${ticker}:`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
