// ─── News & Market Data ───────────────────────────────────────────────────────

export interface NewsArticle {
  title: string
  summary: string
  url: string
  source: string
  datetime: number // unix timestamp (seconds)
  date: string    // YYYY-MM-DD derived
}

export interface BasicFinancials {
  peRatio: number | null
  eps: number | null
  marketCapitalization: number | null // in millions USD
  week52High: number | null
  week52Low: number | null
  revenueGrowthTTMYoy: number | null // % YoY revenue growth
  grossMarginTTM: number | null
}

export interface EarningsData {
  nextEarningsDate: string | null
  lastSurprisePct: number | null // % surprise vs estimate
  lastActualEPS: number | null
  lastEstimateEPS: number | null
  lastPeriod: string | null // e.g. "2024-Q4"
}

// ─── Context fed to Claude ────────────────────────────────────────────────────

export interface TickerContext {
  ticker: string
  weekStart: string  // YYYY-MM-DD
  weekEnd: string    // YYYY-MM-DD (Friday)

  // Price momentum
  currentPrice: number
  priceWeekAgo: number
  priceChangePct: number

  // Company-specific news (most relevant)
  companyNews: NewsArticle[]

  // Broad market / macro news (context for all tickers)
  marketNews: NewsArticle[]

  // Fundamentals
  financials: BasicFinancials
  earnings: EarningsData
}

// ─── Claude output ────────────────────────────────────────────────────────────

export interface AgentAnalysis {
  prediction: 'up' | 'down' | 'sideways'
  confidence: number // 0-100
  summary_es: string
  summary_en: string
  highlights: string[]
  reasoning_es: string
  reasoning_en: string
  news_sources: Array<{
    title: string
    url: string
    source: string
    date: string
  }>
}

// ─── Run results ──────────────────────────────────────────────────────────────

export interface TickerRunResult {
  ticker: string
  status: 'success' | 'skipped' | 'error'
  reason?: string
}

export interface RunAnalysisResult {
  weekStart: string
  results: TickerRunResult[]
  successful: number
  failed: number
  skipped: number
  durationMs: number
}
