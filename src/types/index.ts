// ─── Enums / Literales ───────────────────────────────────────────────────────

export type Sector = 'tech' | 'health' | 'etf' | 'commodities' | 'other'
export type Language = 'es' | 'en'
export type TradingDirection = 'up' | 'down' | 'sideways'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type TradeStatus = 'open' | 'closed'
export type NotificationType = 'weekly_report' | 'email_verification' | 'password_reset'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

// ─── Entidades de Base de Datos ──────────────────────────────────────────────

export interface UserProfile {
  user_id: string
  full_name: string | null
  language: Language
  preferred_sectors: Sector[]
  weekly_goal_pct: number
  timezone: string
  email_notifications: boolean
  weekly_report_time: string
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  ticker: string
  name: string | null
  sector: Sector | null
  added_at: string
}

export interface NewsSource {
  title: string
  url: string
  source: string
  date: string
}

export interface WeeklyAnalysis {
  id: string
  ticker: string
  week_start: string
  price_current: number | null
  price_week_ago: number | null
  price_change_pct: number | null
  predicted_direction: TradingDirection | null
  confidence_score: number | null
  confidence_level: ConfidenceLevel | null
  summary_es: string | null
  summary_en: string | null
  highlights: string[] | null
  reasoning_es: string | null
  reasoning_en: string | null
  news_sources: NewsSource[] | null
  generated_at: string
}

export interface Trade {
  id: string
  user_id: string
  ticker: string
  analysis_id: string | null

  // Compra
  buy_date: string | null
  buy_price: number | null
  shares: number | null
  buy_commission: number

  // Venta
  sell_date: string | null
  sell_price: number | null
  sell_commission: number

  // Cálculos automáticos (manejados por trigger en DB)
  investment_gross: number | null
  investment_total: number | null
  revenue_gross: number | null
  revenue_net: number | null
  profit_loss_gross: number | null
  total_commissions: number | null
  profit_loss_net: number | null
  roi_gross_pct: number | null
  roi_net_pct: number | null

  // Estado y predicción
  status: TradeStatus
  predicted_direction: TradingDirection | null
  actual_direction: TradingDirection | null
  prediction_correct: boolean | null

  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  subject: string | null
  recipients: string[] | null
  context: Record<string, unknown> | null
  status: NotificationStatus
  sent_at: string | null
  error_message: string | null
  created_at: string
}

// ─── DTOs / Formularios ───────────────────────────────────────────────────────

export interface BuyTradeInput {
  ticker: string
  buy_price: number
  shares: number
  buy_commission: number
  buy_date?: string
}

export interface SellTradeInput {
  trade_id: string
  sell_price: number
  sell_commission: number
  sell_date?: string
}

export interface AddToWatchlistInput {
  ticker: string
  name?: string
  sector?: Sector
}

// ─── Vistas compuestas (UI) ───────────────────────────────────────────────────

export interface InstrumentSummary {
  ticker: string
  name: string | null
  sector: Sector | null
  analysis: WeeklyAnalysis | null
  openTrade: Trade | null
  pnlAccumulated: number
}

export interface PerformanceMetrics {
  totalPnlNet: number
  totalPnlGross: number
  totalCommissions: number
  weeklyPnlNet: number
  winCount: number
  lossCount: number
  winRate: number
  predictionAccuracy: number
  predictionAccuracyHigh: number
  predictionAccuracyMedium: number
  predictionAccuracyLow: number
}
