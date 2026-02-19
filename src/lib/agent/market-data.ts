/**
 * Yahoo Finance price data — no API key required.
 * Fetches current price and price from ~7 trading days ago.
 */

export interface PriceData {
  currentPrice: number
  priceWeekAgo: number
  priceChangePct: number
}

export async function fetchPriceData(ticker: string): Promise<PriceData> {
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
    `?interval=1d&range=10d`

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Yahoo Finance price fetch failed for ${ticker}: HTTP ${res.status}`)
  }

  const data = await res.json()
  const result = data?.chart?.result?.[0]

  if (!result) {
    throw new Error(`No price data returned for ${ticker}`)
  }

  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []

  // Filter nulls (market closed days / pre-market gaps)
  const validCloses = closes.filter((c): c is number => c != null)

  if (validCloses.length < 2) {
    throw new Error(`Insufficient price history for ${ticker}`)
  }

  const currentPrice = validCloses[validCloses.length - 1]
  const priceWeekAgo = validCloses[0]
  const priceChangePct =
    Math.round(((currentPrice - priceWeekAgo) / priceWeekAgo) * 10000) / 100

  return { currentPrice, priceWeekAgo, priceChangePct }
}
