'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { TrendingUp, BarChart2, X } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  openTradeAction,
  closeTradeAction,
  deleteTradeAction,
  TradeState,
} from '@/lib/trades/actions'
import { TickerSearch } from '@/components/dashboard/TickerSearch'
import type { Trade, TradingDirection } from '@/types'

// ─── Submit Button ────────────────────────────────────────────────────────────

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

// ─── Open Trade Modal ─────────────────────────────────────────────────────────

function OpenTradeModal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState<TradeState, FormData>(openTradeAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      onClose()
    }
  }, [state, onClose])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Registrar compra</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Instrumento <span className="text-danger-600">*</span>
              </label>
              <TickerSearch />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio de compra <span className="text-danger-600">*</span>
              </label>
              <input
                name="buy_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Acciones <span className="text-danger-600">*</span>
              </label>
              <input
                name="shares"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comisión compra
              </label>
              <input
                name="buy_commission"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha de compra
              </label>
              <input
                name="buy_date"
                type="date"
                defaultValue={today}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dirección esperada
              </label>
              <select
                name="predicted_direction"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              >
                <option value="">Sin predicción</option>
                <option value="up">↑ Alcista</option>
                <option value="down">↓ Bajista</option>
                <option value="sideways">→ Lateral</option>
              </select>
            </div>
          </div>

          {state?.error && (
            <p className="text-xs text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton label="Registrar compra" pendingLabel="Registrando..." />
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Close Trade Modal ────────────────────────────────────────────────────────

function CloseTradeModal({
  trade,
  onClose,
}: {
  trade: Trade
  onClose: () => void
}) {
  const [state, formAction] = useFormState<TradeState, FormData>(closeTradeAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [sellPrice, setSellPrice] = useState('')

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      setSellPrice('')
      onClose()
    }
  }, [state, onClose])

  if (!trade) return null

  const today = new Date().toISOString().split('T')[0]
  const invested = (trade.buy_price ?? 0) * (trade.shares ?? 0) + trade.buy_commission

  // Client-side P&L preview
  const sellPriceNum = parseFloat(sellPrice)
  const showPreview = !isNaN(sellPriceNum) && sellPriceNum > 0 && trade.shares != null
  const previewPnl = showPreview
    ? sellPriceNum * trade.shares! - (trade.buy_price ?? 0) * trade.shares! - trade.buy_commission
    : null

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00Z')
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Cerrar posición</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Buy summary */}
        <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Ticker</span>
            <span className="font-mono font-semibold text-gray-900">{trade.ticker}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Precio de compra</span>
            <span className="font-mono text-gray-700">
              {trade.buy_price != null ? formatCurrency(trade.buy_price) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Acciones</span>
            <span className="font-mono text-gray-700">{trade.shares ?? '—'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Fecha compra</span>
            <span className="text-gray-700">{formatDate(trade.buy_date)}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-gray-200 pt-1.5 mt-1.5">
            <span className="text-gray-500 font-medium">Total invertido</span>
            <span className="font-mono font-semibold text-gray-900">{formatCurrency(invested)}</span>
          </div>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="trade_id" value={trade.id} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio de venta <span className="text-danger-600">*</span>
              </label>
              <input
                name="sell_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comisión venta
              </label>
              <input
                name="sell_commission"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha de venta
              </label>
              <input
                name="sell_date"
                type="date"
                defaultValue={today}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* P&L preview */}
          {showPreview && previewPnl != null && (
            <div
              className={cn(
                'rounded-lg px-3 py-2.5 flex justify-between items-center text-xs',
                previewPnl >= 0
                  ? 'bg-success-50 border border-success-100'
                  : 'bg-danger-50 border border-danger-100'
              )}
            >
              <span className={previewPnl >= 0 ? 'text-success-700' : 'text-danger-700'}>
                P&L estimado (sin comisión venta)
              </span>
              <span
                className={cn(
                  'font-mono font-semibold',
                  previewPnl >= 0 ? 'text-success-700' : 'text-danger-700'
                )}
              >
                {previewPnl >= 0 ? '+' : ''}
                {formatCurrency(previewPnl)}
              </span>
            </div>
          )}

          {state?.error && (
            <p className="text-xs text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton label="Cerrar posición" pendingLabel="Cerrando..." />
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Direction Badge ──────────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: TradingDirection | null }) {
  if (!direction) return <span className="text-gray-300">—</span>
  const map: Record<TradingDirection, { label: string; cls: string }> = {
    up: { label: '↑ Alcista', cls: 'bg-success-50 text-success-700 border-success-100' },
    down: { label: '↓ Bajista', cls: 'bg-danger-50 text-danger-700 border-danger-100' },
    sideways: { label: '→ Lateral', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const { label, cls } = map[direction]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  )
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({ tradeId }: { tradeId: string }) {
  const [, formAction] = useFormState<TradeState, FormData>(deleteTradeAction, null)
  return (
    <form action={formAction}>
      <input type="hidden" name="trade_id" value={tradeId} />
      <button
        type="submit"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
        title="Eliminar trade"
        aria-label="Eliminar trade abierto"
        onClick={(e) => {
          if (!confirm('¿Eliminar este trade? Esta acción no se puede deshacer.')) {
            e.preventDefault()
          }
        }}
      >
        <X size={14} />
      </button>
    </form>
  )
}

// ─── Open Trades Table ────────────────────────────────────────────────────────

function OpenTradesTable({
  trades,
  onClose,
  onOpenBuyModal,
}: {
  trades: Trade[]
  onClose: (trade: Trade) => void
  onOpenBuyModal: () => void
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00Z')
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <TrendingUp size={40} className="text-gray-300 mb-3" />
        <p className="text-base font-medium text-gray-500 mb-1">Sin trades abiertos</p>
        <p className="text-sm text-gray-400 mb-5">
          Registra una compra para empezar a hacer seguimiento.
        </p>
        <button
          onClick={onOpenBuyModal}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Registrar compra
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Ticker
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Fecha compra
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Precio C.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Acciones
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Invertido
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Dir. esp.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {trades.map((trade) => {
            const invested =
              (trade.buy_price ?? 0) * (trade.shares ?? 0) + trade.buy_commission
            return (
              <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <span className="font-mono font-semibold text-gray-900">{trade.ticker}</span>
                </td>
                <td className="px-4 py-3.5 text-gray-600">{formatDate(trade.buy_date)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                  {trade.buy_price != null ? formatCurrency(trade.buy_price) : '—'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                  {trade.shares ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                  {formatCurrency(invested)}
                </td>
                <td className="px-4 py-3.5">
                  <DirectionBadge direction={trade.predicted_direction} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onClose(trade)}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      Cerrar
                    </button>
                    <DeleteButton tradeId={trade.id} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Closed Trades Table ──────────────────────────────────────────────────────

function ClosedTradesTable({ trades }: { trades: Trade[] }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00Z')
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <BarChart2 size={40} className="text-gray-300 mb-3" />
        <p className="text-base font-medium text-gray-500 mb-1">Sin trades cerrados aún</p>
        <p className="text-sm text-gray-400">
          Cuando cierres una posición, aparecerá aquí con su P&L y ROI.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Ticker
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Compra
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Venta
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Precio C.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Precio V.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              P&L neto
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              ROI
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
              Predicción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {trades.map((trade) => {
            const pnl = trade.profit_loss_net ?? 0
            const roi = trade.roi_net_pct ?? null
            const isWin = pnl > 0
            return (
              <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <span className="font-mono font-semibold text-gray-900">{trade.ticker}</span>
                </td>
                <td className="px-4 py-3.5 text-gray-600">{formatDate(trade.buy_date)}</td>
                <td className="px-4 py-3.5 text-gray-600">{formatDate(trade.sell_date)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                  {trade.buy_price != null ? formatCurrency(trade.buy_price) : '—'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                  {trade.sell_price != null ? formatCurrency(trade.sell_price) : '—'}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span
                    className={cn(
                      'font-mono font-medium',
                      isWin ? 'text-success-600' : pnl < 0 ? 'text-danger-600' : 'text-gray-600'
                    )}
                  >
                    {pnl >= 0 ? '+' : ''}
                    {formatCurrency(pnl)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {roi != null ? (
                    <span
                      className={cn(
                        'font-mono font-medium',
                        roi >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}
                    >
                      {formatPercent(roi)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {trade.prediction_correct === null ? (
                    <span className="text-gray-300">—</span>
                  ) : trade.prediction_correct ? (
                    <span
                      className="inline-flex items-center rounded-full bg-success-50 border border-success-100 px-2 py-0.5 text-xs font-medium text-success-700"
                      title="Predicción correcta"
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full bg-danger-50 border border-danger-100 px-2 py-0.5 text-xs font-medium text-danger-700"
                      title="Predicción incorrecta"
                    >
                      ✗
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Trades Section (export principal) ───────────────────────────────────────

interface TradesSectionProps {
  openTrades: Trade[]
  closedTrades: Trade[]
}

export function TradesSection({ openTrades, closedTrades }: TradesSectionProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  const [openBuyModal, setOpenBuyModal] = useState(false)
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null)

  return (
    <>
      {openBuyModal && <OpenTradeModal onClose={() => setOpenBuyModal(false)} />}
      {tradeToClose && <CloseTradeModal trade={tradeToClose} onClose={() => setTradeToClose(null)} />}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Trades</h2>
          <button
            onClick={() => setOpenBuyModal(true)}
            className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            + Registrar trade
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setActiveTab('open')}
            className={cn(
              'py-3 mr-6 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'open'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Abiertas
            <span
              className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                activeTab === 'open'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {openTrades.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={cn(
              'py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'closed'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Cerradas
            <span
              className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                activeTab === 'closed'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {closedTrades.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'open' ? (
          <OpenTradesTable
            trades={openTrades}
            onClose={(trade) => setTradeToClose(trade)}
            onOpenBuyModal={() => setOpenBuyModal(true)}
          />
        ) : (
          <ClosedTradesTable trades={closedTrades} />
        )}
      </div>
    </>
  )
}
