/**
 * Finnhub API client — free tier (60 req/min).
 * Covers: company news, general market news, financial metrics, earnings.
 *
 * Free API key: https://finnhub.io/register
 * Env var: FINNHUB_API_KEY
 */

import type { NewsArticle, BasicFinancials, EarningsData } from './types'

const BASE = 'https://finnhub.io/api/v1'
const KEY = () => process.env.FINNHUB_API_KEY ?? ''

function finnhubUrl(path: string, params: Record<string, string>): string {
  const qs = new URLSearchParams({ ...params, token: KEY() }).toString()
  return `${BASE}${path}?${qs}`
}

async function finnhubGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(finnhubUrl(path, params), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`Finnhub ${path} failed: HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

function toDate(unix: number): string {
  return new Date(unix * 1000).toISOString().split('T')[0]
}

// ─── Company News ─────────────────────────────────────────────────────────────

interface FinnhubNewsItem {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
}

/**
 * News articles specific to the company (ticker) in the last 7 days.
 * Returns up to 15 most recent articles.
 */
export async function fetchCompanyNews(
  ticker: string,
  fromDate: string,
  toDate_: string
): Promise<NewsArticle[]> {
  const items = await finnhubGet<FinnhubNewsItem[]>('/company-news', {
    symbol: ticker,
    from: fromDate,
    to: toDate_,
  })

  return items
    .filter((item) => item.headline && item.url)
    .slice(0, 15)
    .map((item) => ({
      title: item.headline,
      summary: item.summary ?? '',
      url: item.url,
      source: item.source,
      datetime: item.datetime,
      date: toDate(item.datetime),
    }))
}

// ─── General Market News ──────────────────────────────────────────────────────

/**
 * Top general financial/market news (macro context).
 * Shared across all tickers in a single analysis run.
 * Returns up to 10 articles.
 */
export async function fetchMarketNews(): Promise<NewsArticle[]> {
  const items = await finnhubGet<FinnhubNewsItem[]>('/news', {
    category: 'general',
  })

  return items
    .filter((item) => item.headline && item.url)
    .slice(0, 10)
    .map((item) => ({
      title: item.headline,
      summary: item.summary ?? '',
      url: item.url,
      source: item.source,
      datetime: item.datetime,
      date: toDate(item.datetime),
    }))
}

// ─── Basic Financials ─────────────────────────────────────────────────────────

interface FinnhubMetricResponse {
  metric: Record<string, number | null>
}

/**
 * Key financial metrics: P/E, EPS, 52-week range, revenue growth, gross margin.
 */
export async function fetchBasicFinancials(ticker: string): Promise<BasicFinancials> {
  const data = await finnhubGet<FinnhubMetricResponse>('/stock/metric', {
    symbol: ticker,
    metric: 'all',
  })

  const m = data.metric ?? {}

  return {
    peRatio: m['peBasicExclExtraTTM'] ?? m['peTTM'] ?? null,
    eps: m['epsBasicExclExtraAnnual'] ?? m['epsTTM'] ?? null,
    marketCapitalization: m['marketCapitalization'] ?? null,
    week52High: m['52WeekHigh'] ?? null,
    week52Low: m['52WeedkLow'] ?? m['52WeekLow'] ?? null,
    revenueGrowthTTMYoy: m['revenueGrowthTTMYoy'] ?? null,
    grossMarginTTM: m['grossMarginTTM'] ?? null,
  }
}

// ─── Earnings ─────────────────────────────────────────────────────────────────

interface FinnhubEarningsItem {
  period: string      // "2024-09-30"
  actual: number | null
  estimate: number | null
  surprisePercent: number | null
}

interface FinnhubEarningsCalendarItem {
  date: string        // "2025-01-28"
  epsEstimate: number | null
}

/**
 * Recent earnings results and next earnings date.
 */
export async function fetchEarnings(ticker: string): Promise<EarningsData> {
  const [calendarRaw, resultsRaw] = await Promise.allSettled([
    finnhubGet<{ earningsCalendar?: FinnhubEarningsCalendarItem[] }>(
      '/calendar/earnings',
      { symbol: ticker, from: new Date().toISOString().split('T')[0], to: futureDate(90) }
    ),
    finnhubGet<FinnhubEarningsItem[]>('/stock/earnings', { symbol: ticker }),
  ])

  // Next earnings date
  let nextEarningsDate: string | null = null
  if (calendarRaw.status === 'fulfilled') {
    const cal = calendarRaw.value as { earningsCalendar?: FinnhubEarningsCalendarItem[] }
    const items = cal.earningsCalendar ?? []
    nextEarningsDate = items[0]?.date ?? null
  }

  // Last earnings result
  let lastSurprisePct: number | null = null
  let lastActualEPS: number | null = null
  let lastEstimateEPS: number | null = null
  let lastPeriod: string | null = null

  if (resultsRaw.status === 'fulfilled' && Array.isArray(resultsRaw.value)) {
    const last = (resultsRaw.value as FinnhubEarningsItem[])[0]
    if (last) {
      lastSurprisePct = last.surprisePercent ?? null
      lastActualEPS = last.actual ?? null
      lastEstimateEPS = last.estimate ?? null
      lastPeriod = last.period ?? null
    }
  }

  return { nextEarningsDate, lastSurprisePct, lastActualEPS, lastEstimateEPS, lastPeriod }
}

function futureDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
