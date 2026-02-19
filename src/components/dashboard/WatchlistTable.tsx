'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import Link from 'next/link'
import { Eye, X, TrendingUp, TrendingDown, Minus, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { removeFromWatchlistAction, WatchlistState } from '@/lib/watchlist/actions'
import type { WatchlistItem, WeeklyAnalysis, ConfidenceLevel, TradingDirection } from '@/types'

export interface EnrichedWatchlistItem {
  watchlistItem: WatchlistItem
  analysis: WeeklyAnalysis | null
  pnlAccumulated: number
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const styles: Record<ConfidenceLevel, string> = {
    high:   'bg-success-50 text-success-700 border-success-100',
    medium: 'bg-warning-50 text-warning-700 border-warning-100',
    low:    'bg-danger-50 text-danger-700 border-danger-100',
  }
  const labels: Record<ConfidenceLevel, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', styles[level])}>
      {labels[level]}
    </span>
  )
}

function DirectionBadge({ direction }: { direction: TradingDirection }) {
  const config: Record<TradingDirection, { label: string; icon: React.ReactNode; style: string }> = {
    up: {
      label: 'Alcista',
      icon: <TrendingUp size={11} />,
      style: 'bg-success-50 text-success-700 border-success-100',
    },
    down: {
      label: 'Bajista',
      icon: <TrendingDown size={11} />,
      style: 'bg-danger-50 text-danger-700 border-danger-100',
    },
    sideways: {
      label: 'Lateral',
      icon: <Minus size={11} />,
      style: 'bg-gray-100 text-gray-600 border-gray-200',
    },
  }
  const { label, icon, style } = config[direction]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', style)}>
      {icon} {label}
    </span>
  )
}

function SectorBadge({ sector }: { sector: string }) {
  const labels: Record<string, string> = {
    tech: 'Tech', health: 'Salud', etf: 'ETF', commodities: 'Materias', other: 'Otro',
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      {labels[sector] ?? sector}
    </span>
  )
}

// ─── Analysis Modal ───────────────────────────────────────────────────────────

function AnalysisModal({
  ticker,
  analysis,
  onClose,
}: {
  ticker: string
  analysis: WeeklyAnalysis
  onClose: () => void
}) {
  const [showReasoning, setShowReasoning] = useState(false)
  const [showSources, setShowSources]     = useState(false)

  const weekDate = new Date(analysis.week_start + 'T12:00:00Z').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const priceChangeColor =
    (analysis.price_change_pct ?? 0) > 0
      ? 'text-success-600'
      : (analysis.price_change_pct ?? 0) < 0
      ? 'text-danger-600'
      : 'text-gray-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-lg font-bold text-gray-900">{ticker}</span>
                {analysis.predicted_direction && (
                  <DirectionBadge direction={analysis.predicted_direction} />
                )}
                {analysis.confidence_level && (
                  <ConfidenceBadge level={analysis.confidence_level} />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Semana del {weekDate}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Price row */}
          {analysis.price_current != null && (
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="font-mono font-semibold text-gray-900">
                ${analysis.price_current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {analysis.price_change_pct != null && (
                <span className={cn('font-mono text-xs', priceChangeColor)}>
                  {analysis.price_change_pct > 0 ? '+' : ''}{analysis.price_change_pct.toFixed(2)}% esta semana
                </span>
              )}
              {analysis.confidence_score != null && (
                <span className="ml-auto text-xs text-gray-400">
                  Confianza: <span className="font-medium text-gray-600">{analysis.confidence_score}%</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Summary */}
          {analysis.summary_es && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Resumen</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary_es}</p>
            </div>
          )}

          {/* Highlights */}
          {analysis.highlights && analysis.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Factores clave</h3>
              <ul className="space-y-1.5">
                {analysis.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full reasoning — collapsible */}
          {analysis.reasoning_es && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowReasoning((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Análisis completo
                {showReasoning ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showReasoning && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3">
                  {analysis.reasoning_es}
                </div>
              )}
            </div>
          )}

          {/* News sources — collapsible */}
          {analysis.news_sources && analysis.news_sources.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSources((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fuentes ({analysis.news_sources.length})
                {showSources ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showSources && (
                <ul className="border-t border-gray-100 divide-y divide-gray-50">
                  {analysis.news_sources.map((s, i) => (
                    <li key={i} className="px-4 py-2.5">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 group"
                      >
                        <ExternalLink size={12} className="mt-0.5 shrink-0 text-gray-400 group-hover:text-gray-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900 truncate">
                            {s.title}
                          </p>
                          <p className="text-xs text-gray-400">{s.source} · {s.date}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Remove button ─────────────────────────────────────────────────────────────

function RemoveButton({ ticker }: { ticker: string }) {
  const [, formAction] = useFormState<WatchlistState, FormData>(removeFromWatchlistAction, null)
  return (
    <form action={formAction}>
      <input type="hidden" name="ticker" value={ticker} />
      <button
        type="submit"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
        title={`Quitar ${ticker}`}
        aria-label={`Quitar ${ticker} del watchlist`}
      >
        <X size={14} />
      </button>
    </form>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface WatchlistTableProps {
  items: EnrichedWatchlistItem[]
  onAddClick?: () => void
}

export function WatchlistTable({ items, onAddClick }: WatchlistTableProps) {
  const [modalData, setModalData] = useState<{ ticker: string; analysis: WeeklyAnalysis } | null>(null)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Eye size={40} className="text-gray-300 mb-3" />
        <p className="text-base font-medium text-gray-500 mb-1">Tu watchlist está vacío</p>
        <p className="text-sm text-gray-400 mb-5">
          Agrega instrumentos para hacer seguimiento de tu análisis semanal.
        </p>
        <button
          onClick={onAddClick}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Agregar instrumento
        </button>
      </div>
    )
  }

  return (
    <>
      {modalData && (
        <AnalysisModal
          ticker={modalData.ticker}
          analysis={modalData.analysis}
          onClose={() => setModalData(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Sector</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Predicción</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">P&L acum.</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(({ watchlistItem, analysis, pnlAccumulated }) => {
              const hasPnl = pnlAccumulated !== 0
              return (
                <tr key={watchlistItem.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Ticker */}
                  <td className="px-6 py-3.5">
                    <span className="font-mono font-semibold text-gray-900">{watchlistItem.ticker}</span>
                    {watchlistItem.name && (
                      <span className="ml-2 text-xs text-gray-400">{watchlistItem.name}</span>
                    )}
                  </td>

                  {/* Sector */}
                  <td className="px-4 py-3.5">
                    {watchlistItem.sector ? (
                      <SectorBadge sector={watchlistItem.sector} />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Predicción */}
                  <td className="px-4 py-3.5">
                    {analysis?.predicted_direction ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <DirectionBadge direction={analysis.predicted_direction} />
                        {analysis.confidence_level && (
                          <ConfidenceBadge level={analysis.confidence_level} />
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                        Sin análisis
                      </span>
                    )}
                  </td>

                  {/* P&L */}
                  <td className="px-4 py-3.5 text-right">
                    {hasPnl ? (
                      <span className={cn('font-mono font-medium', pnlAccumulated > 0 ? 'text-success-600' : 'text-danger-600')}>
                        {pnlAccumulated > 0 ? '+' : ''}{formatCurrency(pnlAccumulated)}
                      </span>
                    ) : (
                      <span className="font-mono text-gray-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {analysis ? (
                        <button
                          onClick={() => setModalData({ ticker: watchlistItem.ticker, analysis })}
                          className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                          Ver análisis
                        </button>
                      ) : (
                        <span className="rounded-md px-2.5 py-1 text-xs text-gray-300">Sin análisis</span>
                      )}
                      <Link
                        href="/dashboard/trades"
                        className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      >
                        + Trade
                      </Link>
                      <RemoveButton ticker={watchlistItem.ticker} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
