'use client'

import { useState, useTransition } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useFormState, useFormStatus } from 'react-dom'
import { X } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WatchlistTable, EnrichedWatchlistItem } from './WatchlistTable'
import { TickerSearch, TickerResult } from './TickerSearch'
import { addToWatchlistAction, WatchlistState } from '@/lib/watchlist/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Agregando...' : 'Agregar'}
    </button>
  )
}

// No `open` prop — parent uses `&&` to mount/unmount, which resets useFormState
function Modal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState<WatchlistState, FormData>(
    addToWatchlistAction,
    null
  )
  const [name, setName]     = useState('')
  const [sector, setSector] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      onClose()
    }
  }, [state, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Map Yahoo Finance sector string → our sector_type enum
  const mapSector = (result: TickerResult): string => {
    if (result.type === 'ETF' || result.type === 'MUTUALFUND') return 'etf'
    const map: Record<string, string> = {
      'Technology': 'tech',
      'Healthcare': 'health',
      'Basic Materials': 'commodities',
      'Energy': 'commodities',
    }
    return map[result.sector ?? ''] ?? 'other'
  }

  const handleTickerSelect = (result: TickerResult) => {
    setName(result.name)
    setSector(mapSector(result))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-ticker-title"
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="add-ticker-title" className="text-base font-semibold text-gray-900">
            Agregar instrumento
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Instrumento <span className="text-danger-500">*</span>
            </label>
            <TickerSearch onSelect={handleTickerSelect} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor="wl-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre{' '}
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="wl-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Apple Inc."
                maxLength={100}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="wl-sector" className="block text-sm font-medium text-gray-700 mb-1.5">
                Sector{' '}
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </label>
              <select
                id="wl-sector"
                name="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
              >
                <option value="">Sin sector</option>
                <option value="tech">Tech</option>
                <option value="health">Salud</option>
                <option value="etf">ETF</option>
                <option value="commodities">Materias primas</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}

interface WatchlistSectionProps {
  items: EnrichedWatchlistItem[]
  count: number
}

export function WatchlistSection({ items, count }: WatchlistSectionProps) {
  const [open, setOpen] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<
    'idle' | 'running' | 'done' | 'error'
  >('idle')
  const [analysisMsg, setAnalysisMsg] = useState('')
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleRunAnalysis = () => {
    if (count === 0) return
    setAnalysisStatus('running')
    setAnalysisMsg('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/agent/run', { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          setAnalysisStatus('error')
          setAnalysisMsg(data.error ?? 'Error desconocido')
          return
        }

        if (data.successful === 0 && data.failed > 0) {
          setAnalysisStatus('error')
          setAnalysisMsg(
            `${data.failed} análisis fallaron. Verifica que las API keys estén configuradas y reinicia el servidor.`
          )
          return
        }

        setAnalysisStatus('done')
        setAnalysisMsg(
          `${data.successful} análisis generados · ${data.skipped} ya estaban al día · ${data.failed} errores`
        )
        router.refresh()
      } catch {
        setAnalysisStatus('error')
        setAnalysisMsg('No se pudo conectar con el servidor')
      }
    })
  }

  return (
    <>
      {open && <Modal onClose={() => setOpen(false)} />}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Watchlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {count} instrumento{count !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analysisStatus === 'running' || count === 0}
              title={count === 0 ? 'Agrega instrumentos primero' : 'Generar análisis semanal con IA'}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={15} className={analysisStatus === 'running' ? 'animate-pulse' : ''} />
              {analysisStatus === 'running' ? 'Analizando...' : 'Analizar'}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
        </div>

        {/* Analysis status feedback */}
        {analysisStatus !== 'idle' && (
          <div
            className={`px-6 py-2.5 text-xs border-b border-gray-100 ${
              analysisStatus === 'running'
                ? 'bg-gray-50 text-gray-500'
                : analysisStatus === 'done'
                ? 'bg-success-50 text-success-700'
                : 'bg-danger-50 text-danger-700'
            }`}
          >
            {analysisStatus === 'running'
              ? 'Generando análisis con IA... esto puede tomar unos segundos por instrumento.'
              : analysisMsg}
          </div>
        )}

        <WatchlistTable items={items} onAddClick={() => setOpen(true)} />
      </div>
    </>
  )
}
