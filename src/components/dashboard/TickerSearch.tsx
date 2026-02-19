'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  EQUITY: 'Acción',
  ETF: 'ETF',
  INDEX: 'Índice',
  MUTUALFUND: 'Fondo',
  CRYPTOCURRENCY: 'Cripto',
}

export interface TickerResult {
  symbol: string
  name: string
  exchange: string
  type: string
  sector: string | null
}

interface TickerSearchProps {
  onSelect?: (result: TickerResult) => void
}

export function TickerSearch({ onSelect }: TickerSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TickerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TickerResult | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/tickers/search?q=${encodeURIComponent(value)}`)
      const data: TickerResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
      setActiveIndex(-1)
    } catch {
      setResults([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    setSelected(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  const handleSelect = (result: TickerResult) => {
    setSelected(result)
    setQuery(result.symbol)
    setOpen(false)
    setResults([])
    setActiveIndex(-1)
    onSelect?.(result)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Value submitted in the form — selected symbol or uppercased typed text
  const submitValue = selected?.symbol ?? query.trim().toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input carries the actual ticker value in the form */}
      <input type="hidden" name="ticker" value={submitValue} />

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar por ticker o nombre..."
          autoComplete="off"
          className="w-full rounded-lg border border-gray-200 pl-8 pr-8 py-2 text-sm focus:border-gray-400 focus:outline-none"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
          />
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {results.map((result, i) => (
            <li key={result.symbol}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(result)
                }}
                className={cn(
                  'w-full px-3 py-2.5 text-left flex items-center gap-3 text-sm transition-colors',
                  i === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                )}
              >
                <span className="font-mono font-semibold text-gray-900 w-16 shrink-0">
                  {result.symbol}
                </span>
                <span className="text-gray-500 truncate flex-1">{result.name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {TYPE_LABELS[result.type] ?? result.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Selected instrument info */}
      {selected && (
        <p className="mt-1 text-xs text-gray-400">
          {selected.name}
          {selected.exchange && ` · ${selected.exchange}`}
        </p>
      )}
    </div>
  )
}
