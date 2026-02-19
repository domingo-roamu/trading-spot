import { DollarSign, TrendingUp, Percent, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData, computeMetrics } from '@/lib/dashboard/queries'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { WatchlistSection } from '@/components/dashboard/WatchlistSection'
import { formatCurrency, formatPercent, formatWeekRange } from '@/lib/utils'
import type { Trade } from '@/types'
import type { EnrichedWatchlistItem } from '@/components/dashboard/WatchlistTable'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { watchlist, analyses, trades, weekStart } = await getDashboardData(
    supabase,
    user!.id
  )

  const metrics = computeMetrics(trades)

  // Build analysis map (ticker → latest analysis for current week)
  const analysisMap = new Map(analyses.map((a) => [a.ticker, a]))

  // Build PnL map per ticker (all closed trades)
  const pnlByTicker = trades.reduce<Record<string, number>>((acc, t: Trade) => {
    if (t.status === 'closed' && t.profit_loss_net != null) {
      acc[t.ticker] = (acc[t.ticker] ?? 0) + t.profit_loss_net
    }
    return acc
  }, {})

  // Enrich watchlist items
  const enrichedItems: EnrichedWatchlistItem[] = watchlist.map((item) => ({
    watchlistItem: item,
    analysis: analysisMap.get(item.ticker) ?? null,
    pnlAccumulated: pnlByTicker[item.ticker] ?? 0,
  }))

  const isEmpty = metrics.trade_count === 0

  // Determine PnL color
  const pnlColor = isEmpty
    ? 'neutral'
    : metrics.total_pnl_net > 0
    ? 'positive'
    : metrics.total_pnl_net < 0
    ? 'negative'
    : 'neutral'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Semana {formatWeekRange(weekStart)}
        </p>
      </div>

      {/* Metric cards — 2×2 en móvil, 4×1 en lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="P&L neto"
          value={formatCurrency(metrics.total_pnl_net)}
          icon={<DollarSign size={16} />}
          empty={isEmpty}
          valueColor={pnlColor}
        />
        <MetricCard
          label="Comisiones"
          value={formatCurrency(metrics.total_commissions)}
          icon={<BarChart2 size={16} />}
          empty={isEmpty}
          valueColor="neutral"
        />
        <MetricCard
          label="Win rate"
          value={formatPercent(metrics.win_rate, false)}
          icon={<Percent size={16} />}
          empty={isEmpty}
          valueColor={
            isEmpty
              ? 'neutral'
              : metrics.win_rate >= 50
              ? 'positive'
              : 'negative'
          }
        />
        <MetricCard
          label="Operaciones"
          value={String(metrics.trade_count)}
          icon={<TrendingUp size={16} />}
          empty={isEmpty}
          valueColor="neutral"
        />
      </div>

      {/* Watchlist card */}
      <WatchlistSection items={enrichedItems} count={watchlist.length} />
    </div>
  )
}
