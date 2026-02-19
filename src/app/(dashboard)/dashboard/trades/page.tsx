import { DollarSign, TrendingUp, Percent, BarChart2, Wallet, LineChart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { computeMetrics } from '@/lib/dashboard/queries'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { TradesSection } from '@/components/dashboard/TradesSection'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { Trade } from '@/types'

export default async function TradesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const trades = (data ?? []) as Trade[]
  const openTrades = trades.filter((t) => t.status === 'open')
  const closedTrades = trades.filter((t) => t.status === 'closed')

  const metrics = computeMetrics(trades)
  const noClosed = metrics.trade_count === 0
  const noTrades = trades.length === 0

  // Capital total desplegado (abiertas + cerradas)
  const totalInvested = trades.reduce((sum, t) => {
    const inv =
      t.status === 'closed'
        ? (t.investment_total ?? 0)
        : (t.buy_price ?? 0) * (t.shares ?? 0) + t.buy_commission
    return sum + inv
  }, 0)

  // ROI neto realizado: P&L neto / capital invertido en cerradas
  const totalInvestedClosed = closedTrades.reduce(
    (sum, t) => sum + (t.investment_total ?? 0),
    0
  )
  const roiNet =
    totalInvestedClosed > 0 ? (metrics.total_pnl_net / totalInvestedClosed) * 100 : 0

  const pnlColor =
    noClosed ? 'neutral' : metrics.total_pnl_net > 0 ? 'positive' : metrics.total_pnl_net < 0 ? 'negative' : 'neutral'

  const roiColor =
    noClosed ? 'neutral' : roiNet > 0 ? 'positive' : roiNet < 0 ? 'negative' : 'neutral'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trades</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Historial completo de tus operaciones
        </p>
      </div>

      {/* Metric cards — 2×3 en móvil/tablet, 3×2 en lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total invertido"
          value={formatCurrency(totalInvested)}
          icon={<Wallet size={16} />}
          empty={noTrades}
          valueColor="neutral"
        />
        <MetricCard
          label="P&L neto"
          value={formatCurrency(metrics.total_pnl_net)}
          icon={<DollarSign size={16} />}
          empty={noClosed}
          valueColor={pnlColor}
        />
        <MetricCard
          label="Rentabilidad neta"
          value={formatPercent(roiNet)}
          icon={<LineChart size={16} />}
          empty={noClosed}
          valueColor={roiColor}
        />
        <MetricCard
          label="Win rate"
          value={formatPercent(metrics.win_rate, false)}
          icon={<Percent size={16} />}
          empty={noClosed}
          valueColor={
            noClosed ? 'neutral' : metrics.win_rate >= 50 ? 'positive' : 'negative'
          }
        />
        <MetricCard
          label="Comisiones"
          value={formatCurrency(metrics.total_commissions)}
          icon={<BarChart2 size={16} />}
          empty={noClosed}
          valueColor="neutral"
        />
        <MetricCard
          label="Operaciones cerradas"
          value={String(metrics.trade_count)}
          icon={<TrendingUp size={16} />}
          empty={noClosed}
          valueColor="neutral"
        />
      </div>

      {/* Trades section */}
      <TradesSection openTrades={openTrades} closedTrades={closedTrades} />
    </div>
  )
}
