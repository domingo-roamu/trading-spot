'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries, CandlestickSeries, HistogramSeries, AreaData, CandlestickData, HistogramData, Time } from 'lightweight-charts'
import { X, BarChart2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type Range = '1W' | '1M' | '3M' | '1Y' | '5Y'
type ChartType = 'area' | 'candlestick'

interface TickerChartProps {
  ticker: string
  name: string
  price: number | null
  change7d: number | null
  onClose: () => void
}

const RANGES: { value: Range; label: string }[] = [
  { value: '1W', label: '1S' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1A' },
  { value: '5Y', label: '5A' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function TickerChart({ ticker, name, price, change7d, onClose }: TickerChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<typeof AreaSeries> | ISeriesApi<typeof CandlestickSeries> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<typeof HistogramSeries> | null>(null)

  const [range, setRange] = useState<Range>('1M')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Computed stats from candle data
  const rangeChange = candles.length >= 2
    ? ((candles[candles.length - 1].close - candles[0].open) / candles[0].open) * 100
    : null
  const rangeChangeAbs = candles.length >= 2
    ? candles[candles.length - 1].close - candles[0].open
    : null
  const isPositive = (rangeChange ?? 0) >= 0

  // ─── Fetch candles ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/radar/candles?ticker=${encodeURIComponent(ticker)}&range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error del servidor (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data.error) {
          setError(data.error)
          setCandles([])
        } else {
          setCandles(data.candles ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [ticker, range])

  // ─── Create/update chart ────────────────────────────────────────────────────

  const buildChart = useCallback(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      mainSeriesRef.current = null
      volumeSeriesRef.current = null
    }

    const container = chartContainerRef.current
    const chartColor = isPositive ? '#22C55E' : '#EF4444'

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#F3F4F6' },
        horzLines: { color: '#F3F4F6' },
      },
      width: container.clientWidth,
      height: 320,
      rightPriceScale: {
        borderColor: '#E5E7EB',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#E5E7EB',
        timeVisible: range === '1W',
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: '#D1D5DB', width: 1, style: 3, labelBackgroundColor: '#374151' },
        horzLine: { color: '#D1D5DB', width: 1, style: 3, labelBackgroundColor: '#374151' },
      },
      handleScroll: { vertTouchDrag: false },
    })

    chartRef.current = chart

    // Volume series (always shown as histogram at bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
    }))
    volumeSeries.setData(volumeData)
    volumeSeriesRef.current = volumeSeries

    // Main series
    if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: chartColor,
        topColor: isPositive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
        bottomColor: isPositive ? 'rgba(34,197,94,0.02)' : 'rgba(239,68,68,0.02)',
        lineWidth: 2,
        priceFormat: { type: 'price', minMove: 0.01, precision: 2 },
      })

      const lineData: AreaData[] = candles.map((c) => ({
        time: c.time as Time,
        value: c.close,
      }))
      areaSeries.setData(lineData)
      mainSeriesRef.current = areaSeries
    } else {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderDownColor: '#EF4444',
        borderUpColor: '#22C55E',
        wickDownColor: '#EF4444',
        wickUpColor: '#22C55E',
        priceFormat: { type: 'price', minMove: 0.01, precision: 2 },
      })

      const candleData: CandlestickData[] = candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      candleSeries.setData(candleData)
      mainSeriesRef.current = candleSeries
    }

    chart.timeScale().fitContent()

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      chart.applyOptions({ width })
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [candles, chartType, isPositive, range])

  useEffect(() => {
    const cleanup = buildChart()
    return () => cleanup?.()
  }, [buildChart])

  // ─── Keyboard close ─────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl border-l border-gray-200 flex flex-col h-full animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-gray-900">{ticker}</span>
                {rangeChange !== null && (
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold font-mono',
                    isPositive ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                  )}>
                    {isPositive ? '+' : ''}{rangeChange.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{name}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Price */}
          {price != null && (
            <div className="flex items-baseline gap-2 mt-3">
              <span className="font-mono text-2xl font-bold text-gray-900">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {rangeChangeAbs !== null && (
                <span className={cn('font-mono text-sm', isPositive ? 'text-success-600' : 'text-danger-600')}>
                  {isPositive ? '+' : ''}{rangeChangeAbs.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center justify-between mt-4 gap-3">
            {/* Range selector */}
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                    range === r.value
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Chart type toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
              <button
                onClick={() => setChartType('area')}
                title="Gráfico de área"
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors',
                  chartType === 'area'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <TrendingUp size={14} />
              </button>
              <button
                onClick={() => setChartType('candlestick')}
                title="Gráfico de velas"
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors',
                  chartType === 'candlestick'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <BarChart2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 px-3 py-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Cargando datos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          ) : candles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Sin datos disponibles para este rango</p>
            </div>
          ) : (
            <div ref={chartContainerRef} className="w-full h-[320px]" />
          )}
        </div>

        {/* Stats footer */}
        {candles.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Apertura</p>
                <p className="font-mono text-xs font-semibold text-gray-700">
                  ${candles[0].open.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Máximo</p>
                <p className="font-mono text-xs font-semibold text-gray-700">
                  ${Math.max(...candles.map((c) => c.high)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mínimo</p>
                <p className="font-mono text-xs font-semibold text-gray-700">
                  ${Math.min(...candles.map((c) => c.low)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cierre</p>
                <p className="font-mono text-xs font-semibold text-gray-700">
                  ${candles[candles.length - 1].close.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
