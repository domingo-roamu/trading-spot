import { DollarSign, TrendingUp, Percent, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection'
import { computeAnalytics } from '@/lib/analytics/queries'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { Trade } from '@/types'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'closed')
    .order('sell_date', { ascending: false })

  const closedTrades = (data ?? []) as Trade[]
  const analytics = computeAnalytics(closedTrades)
  const empty = analytics.trade_count === 0

  const pnlColor = empty
    ? 'neutral'
    : analytics.total_pnl_net > 0
    ? 'positive'
    : analytics.total_pnl_net < 0
    ? 'negative'
    : 'neutral'

  const roiColor = empty
    ? 'neutral'
    : analytics.roi_net_pct > 0
    ? 'positive'
    : analytics.roi_net_pct < 0
    ? 'negative'
    : 'neutral'

  const winColor = empty
    ? 'neutral'
    : analytics.win_rate >= 50
    ? 'positive'
    : 'negative'

  const predictionEmpty = analytics.prediction.total_with_prediction === 0
  const predictionColor = predictionEmpty
    ? 'neutral'
    : analytics.prediction.accuracy_pct >= 60
    ? 'positive'
    : analytics.prediction.accuracy_pct >= 40
    ? 'neutral'
    : 'negative'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Estadísticas de rendimiento de tus operaciones cerradas
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="P&L neto total"
          value={formatCurrency(analytics.total_pnl_net)}
          icon={<DollarSign size={16} />}
          empty={empty}
          valueColor={pnlColor}
        />
        <MetricCard
          label="ROI neto"
          value={formatPercent(analytics.roi_net_pct)}
          icon={<TrendingUp size={16} />}
          empty={empty}
          valueColor={roiColor}
        />
        <MetricCard
          label="Win rate"
          value={formatPercent(analytics.win_rate, false)}
          icon={<Percent size={16} />}
          empty={empty}
          valueColor={winColor}
        />
        <MetricCard
          label="Precisión IA"
          value={`${analytics.prediction.accuracy_pct.toFixed(0)}%`}
          icon={<Target size={16} />}
          empty={empty || predictionEmpty}
          valueColor={predictionColor}
        />
      </div>

      {/* Detailed analytics */}
      <AnalyticsSection data={analytics} />
    </div>
  )
}
