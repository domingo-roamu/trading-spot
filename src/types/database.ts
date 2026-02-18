// ─────────────────────────────────────────────────────────────────────────────
// Tipos del schema de Supabase — escritos a mano según el schema SQL.
// Para regenerar automáticamente:
//   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Enums del schema ────────────────────────────────────────────────────────

export type SectorType         = 'tech' | 'health' | 'etf' | 'commodities' | 'other'
export type LanguageType       = 'es' | 'en'
export type TradingDirection   = 'up' | 'down' | 'sideways'
export type ConfidenceLevel    = 'high' | 'medium' | 'low'
export type TradeStatus        = 'open' | 'closed'
export type NotificationType   = 'weekly_report' | 'email_verification' | 'password_reset'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

// ─── Estructura de news_sources (guardada como jsonb[]) ──────────────────────

export interface NewsSourceJson {
  title:  string
  url:    string
  source: string
  date:   string
}

// ─── Tipo Database (para createClient<Database>) ─────────────────────────────

export type Database = {
  public: {
    Tables: {

      user_profiles: {
        Row: {
          user_id:              string
          full_name:            string | null
          language:             LanguageType
          preferred_sectors:    SectorType[]
          weekly_goal_pct:      number
          timezone:             string
          email_notifications:  boolean
          weekly_report_time:   string
          onboarding_completed: boolean
          created_at:           string
          updated_at:           string
        }
        Insert: {
          user_id:              string
          full_name?:           string | null
          language?:            LanguageType
          preferred_sectors?:   SectorType[]
          weekly_goal_pct?:     number
          timezone?:            string
          email_notifications?: boolean
          weekly_report_time?:  string
          onboarding_completed?: boolean
        }
        Update: {
          full_name?:           string | null
          language?:            LanguageType
          preferred_sectors?:   SectorType[]
          weekly_goal_pct?:     number
          timezone?:            string
          email_notifications?: boolean
          weekly_report_time?:  string
          onboarding_completed?: boolean
        }
        Relationships: []
      }

      watchlist: {
        Row: {
          id:       string
          user_id:  string
          ticker:   string
          name:     string | null
          sector:   SectorType | null
          added_at: string
        }
        Insert: {
          id?:     string
          user_id: string
          ticker:  string
          name?:   string | null
          sector?: SectorType | null
        }
        Update: {
          ticker?: string
          name?:   string | null
          sector?: SectorType | null
        }
        Relationships: []
      }

      weekly_analyses: {
        Row: {
          id:                  string
          ticker:              string
          week_start:          string
          price_current:       number | null
          price_week_ago:      number | null
          price_change_pct:    number | null
          predicted_direction: TradingDirection | null
          confidence_score:    number | null
          confidence_level:    ConfidenceLevel | null
          summary_es:          string | null
          summary_en:          string | null
          highlights:          string[] | null
          reasoning_es:        string | null
          reasoning_en:        string | null
          news_sources:        NewsSourceJson[]
          generated_at:        string
        }
        Insert: {
          id?:                  string
          ticker:               string
          week_start:           string
          price_current?:       number | null
          price_week_ago?:      number | null
          price_change_pct?:    number | null
          predicted_direction?: TradingDirection | null
          confidence_score?:    number | null
          confidence_level?:    ConfidenceLevel | null
          summary_es?:          string | null
          summary_en?:          string | null
          highlights?:          string[] | null
          reasoning_es?:        string | null
          reasoning_en?:        string | null
          news_sources?:        NewsSourceJson[]
        }
        Update: Partial<Omit<Database['public']['Tables']['weekly_analyses']['Insert'], 'ticker' | 'week_start'>>
        Relationships: []
      }

      trades: {
        Row: {
          id:               string
          user_id:          string
          ticker:           string
          analysis_id:      string | null
          buy_date:         string | null
          buy_price:        number | null
          shares:           number | null
          buy_commission:   number
          sell_date:        string | null
          sell_price:       number | null
          sell_commission:  number
          // Calculados por trigger — no enviar en Insert
          investment_gross:  number | null
          investment_total:  number | null
          revenue_gross:     number | null
          revenue_net:       number | null
          profit_loss_gross: number | null
          total_commissions: number | null
          profit_loss_net:   number | null
          roi_gross_pct:     number | null
          roi_net_pct:       number | null
          // Estado
          status:              TradeStatus
          predicted_direction: TradingDirection | null
          actual_direction:    TradingDirection | null
          prediction_correct:  boolean | null
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id?:                  string
          user_id:              string
          ticker:               string
          analysis_id?:         string | null
          buy_date?:            string | null
          buy_price?:           number | null
          shares?:              number | null
          buy_commission?:      number
          sell_date?:           string | null
          sell_price?:          number | null
          sell_commission?:     number
          status?:              TradeStatus
          predicted_direction?: TradingDirection | null
        }
        Update: {
          buy_date?:            string | null
          buy_price?:           number | null
          shares?:              number | null
          buy_commission?:      number
          sell_date?:           string | null
          sell_price?:          number | null
          sell_commission?:     number
          predicted_direction?: TradingDirection | null
        }
        Relationships: []
      }

      notifications: {
        Row: {
          id:            string
          user_id:       string
          type:          NotificationType
          subject:       string | null
          recipients:    string[] | null
          context:       Json
          status:        NotificationStatus
          sent_at:       string | null
          error_message: string | null
          created_at:    string
        }
        Insert: {
          id?:           string
          user_id:       string
          type:          NotificationType
          subject?:      string | null
          recipients?:   string[] | null
          context?:      Json
          status?:       NotificationStatus
          sent_at?:      string | null
          error_message?: string | null
        }
        Update: {
          status?:        NotificationStatus
          sent_at?:       string | null
          error_message?: string | null
        }
        Relationships: []
      }

      report_generations: {
        Row: {
          id:                   string
          week_start:           string
          total_instruments:    number
          successful_analyses:  number
          failed_analyses:      number
          started_at:           string
          completed_at:         string | null
          duration_seconds:     number | null
          api_calls:            number | null
          estimated_cost_usd:   number | null
          errors:               Json[]
        }
        Insert: {
          id?:                   string
          week_start:            string
          total_instruments?:    number
          successful_analyses?:  number
          failed_analyses?:      number
          completed_at?:         string | null
          duration_seconds?:     number | null
          api_calls?:            number | null
          estimated_cost_usd?:   number | null
          errors?:               Json[]
        }
        Update: {
          total_instruments?:    number
          successful_analyses?:  number
          failed_analyses?:      number
          completed_at?:         string | null
          duration_seconds?:     number | null
          api_calls?:            number | null
          estimated_cost_usd?:   number | null
          errors?:               Json[]
        }
        Relationships: []
      }

    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      sector_type:         SectorType
      language_type:       LanguageType
      trading_direction:   TradingDirection
      confidence_level:    ConfidenceLevel
      trade_status:        TradeStatus
      notification_type:   NotificationType
      notification_status: NotificationStatus
    }
  }
}
