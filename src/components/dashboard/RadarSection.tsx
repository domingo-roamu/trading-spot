'use client'

import { useState, useTransition, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown, Check, Plus } from 'lucide-react'
import { addToWatchlistAction, WatchlistState } from '@/lib/watchlist/actions'
import { RadarRow } from '@/app/(dashboard)/dashboard/radar/page'
import { RadarSector } from '@/data/radar-tickers'
import { cn } from '@/lib/utils'

// ── Sector mapping: radar → watchlist SectorType ──────────────────────────────

const SECTOR_TO_WATCHLIST: Record<RadarSector, string> = {
  etf:        'etf',
  tech:       'tech',
  defense:    'other',
  health:     'health',
  energy:     'commodities',
  finance:    'other',
  industrials:'other',
  materials:  'commodities',
  consumer:   'other',
}

// ── Filter chips ───────────────────────────────────────────────────────────────

const SECTOR_FILTERS: { value: string; label: string }[] = [
  { value: 'all',         label: 'Todos' },
  { value: 'tech',        label: 'Tech' },
  { value: 'defense',     label: 'Defensa' },
  { value: 'health',      label: 'Salud' },
  { value: 'energy',      label: 'Energía' },
  { value: 'finance',     label: 'Finanzas' },
  { value: 'industrials', label: 'Industriales' },
  { value: 'materials',   label: 'Materiales' },
  { value: 'consumer',    label: 'Consumo' },
  { value: 'etf',         label: 'ETFs' },
]

const SECTOR_LABELS: Record<string, string> = {
  etf:        'ETF',
  tech:       'Tech',
  defense:    'Defensa',
  health:     'Salud',
  energy:     'Energía',
  finance:    'Finanzas',
  industrials:'Industriales',
  materials:  'Materiales',
  consumer:   'Consumo',
}

// ── Sort helpers ───────────────────────────────────────────────────────────────

type SortKey = 'ticker' | 'name' | 'sector' | 'price' | 'change_7d' | 'change_30d'
type SortDir = 'asc' | 'desc'

function sortRows(rows: RadarRow[], key: SortKey, dir: SortDir): RadarRow[] {
  return [...rows].sort((a, b) => {
    let av: string | number | null = a[key] ?? null
    let bv: string | number | null = b[key] ?? null

    // Push nulls to the bottom
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1

    if (typeof av === 'string' && typeof bv === 'string') {
      return dir === 'asc'
        ? av.localeCompare(bv)
        : bv.localeCompare(av)
    }

    return dir === 'asc'
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number)
  })
}

// ── Add-to-watchlist form ──────────────────────────────────────────────────────

function AddButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Plus size={12} />
      {pending ? '...' : 'Watchlist'}
    </button>
  )
}

function AddToWatchlistForm({
  row,
  onSuccess,
}: {
  row: RadarRow
  onSuccess: () => void
}) {
  const [state, formAction] = useFormState<WatchlistState, FormData>(
    addToWatchlistAction,
    null
  )

  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state, onSuccess])

  const watchlistSector = SECTOR_TO_WATCHLIST[row.sector as RadarSector] ?? 'other'

  if (state?.success) {
    return (
      <span className="flex items-center gap-1 text-xs text-success-600 font-medium">
        <Check size={12} />
        Agregado
      </span>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="ticker" value={row.ticker} />
      <input type="hidden" name="name" value={row.name} />
      <input type="hidden" name="sector" value={watchlistSector} />
      <AddButton />
      {state?.error && (
        <p className="text-xs text-danger-600 mt-1">{state.error}</p>
      )}
    </form>
  )
}

// ── Sort indicator icon ────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-gray-600" />
    : <ChevronDown size={13} className="text-gray-600" />
}

// ── Change badge ──────────────────────────────────────────────────────────────

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400 text-sm">—</span>
  const positive = value >= 0
  return (
    <span
      className={cn(
        'text-sm font-medium',
        positive ? 'text-success-600' : 'text-danger-600'
      )}
    >
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface RadarSectionProps {
  rows: RadarRow[]
  watchlistTickers: Set<string>
}

export function RadarSection({ rows, watchlistTickers }: RadarSectionProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [refreshMsg, setRefreshMsg] = useState('')

  const [sectorFilter, setSectorFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('change_7d')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Track tickers added in this session (without a full page reload)
  const [sessionAdded, setSessionAdded] = useState<Set<string>>(new Set())

  const handleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('desc')
    }
  }

  const handleRefresh = () => {
    setRefreshStatus('loading')
    setRefreshMsg('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/radar/refresh', { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          setRefreshStatus('error')
          setRefreshMsg(data.error ?? 'Error desconocido')
          return
        }

        setRefreshStatus('done')
        setRefreshMsg(`${data.updated} tickers actualizados · ${data.failed} errores`)
        router.refresh()
      } catch {
        setRefreshStatus('error')
        setRefreshMsg('No se pudo conectar con el servidor')
      }
    })
  }

  const filteredRows = sectorFilter === 'all'
    ? rows
    : rows.filter((r) => r.sector === sectorFilter)

  const sortedRows = sortRows(filteredRows, sortKey, sortDir)

  const hasData = rows.some((r) => r.price !== null)

  const thClass = 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700'
  const tdClass = 'px-4 py-3 text-sm'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          {SECTOR_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSectorFilter(f.value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                sectorFilter === f.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshStatus === 'loading'}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 ml-4"
        >
          <RefreshCw
            size={14}
            className={refreshStatus === 'loading' ? 'animate-spin' : ''}
          />
          {refreshStatus === 'loading' ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </div>

      {/* Refresh status */}
      {refreshStatus !== 'idle' && (
        <div
          className={cn(
            'px-5 py-2 text-xs border-b border-gray-100',
            refreshStatus === 'loading' && 'bg-gray-50 text-gray-500',
            refreshStatus === 'done' && 'bg-success-50 text-success-700',
            refreshStatus === 'error' && 'bg-danger-50 text-danger-700'
          )}
        >
          {refreshStatus === 'loading'
            ? 'Actualizando datos de mercado para todos los tickers...'
            : refreshMsg}
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="px-5 py-12 text-center text-gray-400">
          <p className="text-sm">Sin datos de mercado disponibles.</p>
          <p className="text-xs mt-1">Haz clic en &quot;Actualizar datos&quot; para cargar precios.</p>
        </div>
      )}

      {/* Table */}
      {hasData && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th
                  className={thClass}
                  onClick={() => handleSort('ticker')}
                >
                  <span className="flex items-center gap-1">
                    Ticker
                    <SortIcon col="ticker" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Empresa
                    <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('sector')}
                >
                  <span className="flex items-center gap-1">
                    Sector
                    <SortIcon col="sector" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={cn(thClass, 'text-right')}
                  onClick={() => handleSort('price')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Precio
                    <SortIcon col="price" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={cn(thClass, 'text-right')}
                  onClick={() => handleSort('change_7d')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Var. 7d
                    <SortIcon col="change_7d" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={cn(thClass, 'text-right')}
                  onClick={() => handleSort('change_30d')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Var. 30d
                    <SortIcon col="change_30d" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedRows.map((row) => {
                const inWatchlist =
                  watchlistTickers.has(row.ticker) || sessionAdded.has(row.ticker)

                return (
                  <tr key={row.ticker} className="hover:bg-gray-50/60 transition-colors">
                    <td className={cn(tdClass, 'font-mono font-semibold text-gray-900')}>
                      {row.ticker}
                    </td>
                    <td className={cn(tdClass, 'text-gray-700 max-w-[220px] truncate')}>
                      {row.name}
                    </td>
                    <td className={tdClass}>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {SECTOR_LABELS[row.sector] ?? row.sector}
                      </span>
                    </td>
                    <td className={cn(tdClass, 'text-right tabular-nums text-gray-700')}>
                      {row.price !== null
                        ? `$${row.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className={cn(tdClass, 'text-right tabular-nums')}>
                      <ChangeBadge value={row.change_7d} />
                    </td>
                    <td className={cn(tdClass, 'text-right tabular-nums')}>
                      <ChangeBadge value={row.change_30d} />
                    </td>
                    <td className={cn(tdClass, 'text-right')}>
                      {inWatchlist ? (
                        <span className="flex items-center justify-end gap-1 text-xs text-gray-400 font-medium">
                          <Check size={12} />
                          En watchlist
                        </span>
                      ) : (
                        <div className="flex justify-end">
                          <AddToWatchlistForm
                            row={row}
                            onSuccess={() => {
                              setSessionAdded((prev) => new Set(prev).add(row.ticker))
                              router.refresh()
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {sortedRows.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No hay instrumentos para el filtro seleccionado.
            </p>
          )}
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400">
        {sortedRows.length} instrumento{sortedRows.length !== 1 ? 's' : ''} mostrado{sortedRows.length !== 1 ? 's' : ''}
        {sectorFilter !== 'all' && ` · filtrado por ${SECTOR_LABELS[sectorFilter] ?? sectorFilter}`}
      </div>
    </div>
  )
}
