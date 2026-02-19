import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { Trade, WatchlistItem, WeeklyAnalysis } from '@/types'
import { getWeekStart } from '@/lib/utils'

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const weekStart = getWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [watchlistResult, analysesResult, tradesResult] = await Promise.all([
    supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: true }),
    supabase
      .from('weekly_analyses')
      .select('*')
      .eq('week_start', weekStartStr),
    supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId),
  ])

  return {
    watchlist: (watchlistResult.data ?? []) as WatchlistItem[],
    analyses: (analysesResult.data ?? []) as WeeklyAnalysis[],
    trades: (tradesResult.data ?? []) as Trade[],
    weekStart,
  }
}

export interface DashboardMetrics {
  total_pnl_net: number
  total_commissions: number
  win_rate: number
  trade_count: number
}

export function computeMetrics(trades: Trade[]): DashboardMetrics {
  const closedTrades = trades.filter((t) => t.status === 'closed')
  const trade_count = closedTrades.length

  const total_pnl_net = closedTrades.reduce(
    (sum, t) => sum + (t.profit_loss_net ?? 0),
    0
  )
  const total_commissions = closedTrades.reduce(
    (sum, t) => sum + (t.total_commissions ?? 0),
    0
  )

  const wins = closedTrades.filter((t) => (t.profit_loss_net ?? 0) > 0).length
  const win_rate = trade_count > 0 ? (wins / trade_count) * 100 : 0

  return { total_pnl_net, total_commissions, win_rate, trade_count }
}
