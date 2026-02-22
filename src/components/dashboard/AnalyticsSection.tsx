import { BarChart2, TrendingDown, TrendingUp, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types'
import type { AnalyticsData, TickerStats, DirectionStats } from '@/lib/analytics/queries'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function PnlBar({ stats, maxAbsPnl }: { stats: TickerStats; maxAbsPnl: number }) {
  const pct = maxAbsPnl > 0 ? Math.abs(stats.pnl_net) / maxAbsPnl : 0
  const isPositive = stats.pnl_net >= 0

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm font-semibold text-gray-700 w-16 shrink-0">
        {stats.ticker}
      </span>
      <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden">
        <div
          className={cn('h-full rounded', isPositive ? 'bg-success-500' : 'bg-danger-500')}
          style={{ width: `${Math.max(pct * 100, 2)}%` }}
        />
      </div>
      <span
        className={cn(
          'font-mono text-sm font-semibold w-24 text-right shrink-0',
          isPositive ? 'text-success-600' : 'text-danger-600'
        )}
      >
        {formatCurrency(stats.pnl_net)}
      </span>
      <span className="text-xs text-gray-400 w-12 text-right shrink-0">
        {stats.trades} op.
      </span>
    </div>
  )
}

function PredictionBar({
  label,
  total,
  correct,
  accuracy_pct,
}: { label: string } & DirectionStats) {
  if (total === 0) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {correct}/{total}
          </span>
          <span
            className={cn(
              'text-sm font-semibold font-mono w-10 text-right',
              accuracy_pct >= 60
                ? 'text-success-600'
                : accuracy_pct >= 40
                ? 'text-warning-600'
                : 'text-danger-600'
            )}
          >
            {accuracy_pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            accuracy_pct >= 60
              ? 'bg-success-500'
              : accuracy_pct >= 40
              ? 'bg-warning-500'
              : 'bg-danger-500'
          )}
          style={{ width: `${accuracy_pct}%` }}
        />
      </div>
    </div>
  )
}

function TradeRow({ trade, rank }: { trade: Trade; rank: number }) {
  const pnl = trade.profit_loss_net ?? 0
  const roi = trade.roi_net_pct ?? 0
  const isPositive = pnl >= 0

  const buyLabel = trade.buy_date
    ? new Date(trade.buy_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    : '—'
  const sellLabel = trade.sell_date
    ? new Date(trade.sell_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-4 shrink-0">{rank}</span>
      <span className="font-mono text-sm font-semibold text-gray-800 w-16 shrink-0">
        {trade.ticker}
      </span>
      <span className="text-xs text-gray-400 flex-1">
        {buyLabel}
        {sellLabel && ` → ${sellLabel}`}
      </span>
      <span
        className={cn(
          'font-mono text-sm font-semibold',
          isPositive ? 'text-success-600' : 'text-danger-600'
        )}
      >
        {formatCurrency(pnl)}
      </span>
      <span
        className={cn(
          'text-xs font-mono w-14 text-right shrink-0',
          isPositive ? 'text-success-600' : 'text-danger-600'
        )}
      >
        {roi >= 0 ? '+' : ''}
        {roi.toFixed(1)}%
      </span>
    </div>
  )
}

interface AnalyticsSectionProps {
  data: AnalyticsData
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  const { trade_count, byTicker, prediction, bestTrades, worstTrades, avg_trade_duration_days } =
    data

  if (trade_count === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
        <BarChart2 size={36} className="text-gray-200" />
        <p className="text-base font-medium text-gray-500">Sin datos suficientes</p>
        <p className="text-sm text-gray-400">
          Registra y cierra al menos un trade para ver tus estadísticas de rendimiento.
        </p>
      </div>
    )
  }

  const maxAbsPnl = Math.max(...byTicker.map((t) => Math.abs(t.pnl_net)), 1)
  const losingTrades = worstTrades.filter((t) => (t.profit_loss_net ?? 0) < 0)

  return (
    <div className="space-y-6">
      {/* P&L por instrumento */}
      <SectionCard title="Rendimiento por instrumento">
        <div className="space-y-3">
          {byTicker.map((stats) => (
            <PnlBar key={stats.ticker} stats={stats} maxAbsPnl={maxAbsPnl} />
          ))}
        </div>
      </SectionCard>

      {/* Predicciones + Top trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precisión de predicciones */}
        <SectionCard title="Precisión de predicciones">
          {prediction.total_with_prediction === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Target size={28} className="text-gray-200" />
              <p className="text-sm text-gray-400">
                Activa una predicción al abrir trades para ver tu precisión aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Resumen global */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Precisión global
                  </p>
                  <p className="text-3xl font-mono font-semibold text-gray-900 mt-1">
                    {prediction.accuracy_pct.toFixed(0)}%
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-xs text-gray-400">
                    {prediction.correct} de {prediction.total_with_prediction} correctas
                  </p>
                  {avg_trade_duration_days > 0 && (
                    <p className="text-xs text-gray-400">
                      ~{avg_trade_duration_days.toFixed(0)} días promedio / trade
                    </p>
                  )}
                </div>
              </div>

              {/* Por dirección */}
              <div className="space-y-4">
                <PredictionBar label="Alcista ↑" {...prediction.by_direction.up} />
                <PredictionBar label="Bajista ↓" {...prediction.by_direction.down} />
                <PredictionBar label="Lateral →" {...prediction.by_direction.sideways} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Mejores y peores trades */}
        <SectionCard title="Top trades">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={13} className="text-success-600" />
              <p className="text-xs font-semibold text-success-600 uppercase tracking-wide">
                Mejores
              </p>
            </div>
            {bestTrades.map((trade, i) => (
              <TradeRow key={trade.id} trade={trade} rank={i + 1} />
            ))}

            {losingTrades.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mb-2 mt-5">
                  <TrendingDown size={13} className="text-danger-600" />
                  <p className="text-xs font-semibold text-danger-600 uppercase tracking-wide">
                    Peores
                  </p>
                </div>
                {losingTrades.map((trade, i) => (
                  <TradeRow key={trade.id} trade={trade} rank={i + 1} />
                ))}
              </>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
