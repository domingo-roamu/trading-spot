import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES = ['EQUITY', 'ETF', 'INDEX', 'MUTUALFUND', 'CRYPTOCURRENCY']

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  try {
    const url =
      `https://query1.finance.yahoo.com/v1/finance/search` +
      `?q=${encodeURIComponent(q)}&lang=en-US&region=US` +
      `&quotesCount=8&newsCount=0&enableFuzzyQuery=false`

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) return NextResponse.json([])

    const data = await res.json()

    const quotes = (data.quotes ?? []) as Array<{
      symbol: string
      shortname?: string
      longname?: string
      exchange?: string
      quoteType?: string
      sector?: string
    }>

    const results = quotes
      .filter((q) => ALLOWED_TYPES.includes(q.quoteType ?? ''))
      .slice(0, 8)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        exchange: q.exchange ?? '',
        type: q.quoteType ?? '',
        sector: q.sector ?? null,
      }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
