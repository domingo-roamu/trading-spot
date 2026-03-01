/**
 * Yahoo Finance price data for the Radar — no API key required.
 * Fetches current price, 7-day change, and 30-day change.
 */

export interface RadarPriceData {
  currentPrice: number
  change7d: number  // percentage
  change30d: number // percentage
}

export async function getRadarPriceData(ticker: string): Promise<RadarPriceData> {
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
    `?interval=1d&range=35d`

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Yahoo Finance fetch failed for ${ticker}: HTTP ${res.status}`)
  }

  const data = await res.json()
  const result = data?.chart?.result?.[0]

  if (!result) {
    throw new Error(`No price data returned for ${ticker}`)
  }

  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []

  // Filter out nulls (market closed days, pre-market gaps)
  const validCloses = closes.filter((c): c is number => c != null)

  if (validCloses.length < 2) {
    throw new Error(`Insufficient price history for ${ticker}`)
  }

  const currentPrice = validCloses[validCloses.length - 1]

  // 7-day change: compare last close vs ~7 trading days ago
  const idx7d = Math.max(0, validCloses.length - 6)
  const price7dAgo = validCloses[idx7d]
  const change7d =
    Math.round(((currentPrice - price7dAgo) / price7dAgo) * 10000) / 100

  // 30-day change: oldest close in the 35d window
  const price30dAgo = validCloses[0]
  const change30d =
    Math.round(((currentPrice - price30dAgo) / price30dAgo) * 10000) / 100

  return { currentPrice, change7d, change30d }
}
