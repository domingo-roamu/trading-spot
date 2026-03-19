/**
 * GET /api/radar/candles?ticker=AAPL&range=1M
 * Returns OHLCV candle data from Yahoo Finance for charting.
 *
 * Ranges: 1W, 1M, 3M, 1Y, 5Y
 */

import { NextRequest, NextResponse } from 'next/server'

type Range = '1W' | '1M' | '3M' | '1Y' | '5Y'

// Yahoo Finance range & interval mapping
const RANGE_CONFIG: Record<Range, { range: string; interval: string }> = {
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1h' },
  '3M': { range: '3mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
}

const VALID_RANGES = new Set(Object.keys(RANGE_CONFIG))

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  const rangeParam = searchParams.get('range')?.toUpperCase() as Range | undefined

  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })
  }
  if (!rangeParam || !VALID_RANGES.has(rangeParam)) {
    return NextResponse.json({ error: 'Invalid range. Use: 1W, 1M, 3M, 1Y, 5Y' }, { status: 400 })
  }

  const { range, interval } = RANGE_CONFIG[rangeParam]

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance error: HTTP ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const result = data?.chart?.result?.[0]

    if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
      return NextResponse.json({ candles: [], ticker, range: rangeParam })
    }

    const timestamps = result.timestamp
    const quote = result.indicators.quote[0]

    // Transform to array of candle objects, filtering out null values
    const candles = timestamps
      .map((time: number, i: number) => ({
        time,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i],
      }))
      .filter((c: { close: number | null }) => c.close != null)

    return NextResponse.json({ candles, ticker, range: rangeParam })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[radar/candles] Error fetching ${ticker}:`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
