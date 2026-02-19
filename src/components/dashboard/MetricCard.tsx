import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  empty?: boolean
  valueColor?: 'positive' | 'negative' | 'neutral'
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  empty = false,
  valueColor = 'neutral',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-gray-400">{icon}</span>
      </div>

      <div>
        {empty ? (
          <span className="font-mono text-3xl font-semibold text-gray-300">—</span>
        ) : (
          <span
            className={cn(
              'font-mono text-3xl font-semibold',
              valueColor === 'positive' && 'text-success-600',
              valueColor === 'negative' && 'text-danger-600',
              valueColor === 'neutral' && 'text-gray-800'
            )}
          >
            {value}
          </span>
        )}
      </div>

      {trend && !empty && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-success-600' : 'text-danger-600'
            )}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        </div>
      )}

      {empty && (
        <p className="text-xs text-gray-400">Sin datos aún</p>
      )}
    </div>
  )
}
