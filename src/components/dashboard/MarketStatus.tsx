'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

function checkMarketOpen(): boolean {
  const now = new Date()

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now)

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const hour    = parseInt(parts.find((p) => p.type === 'hour')?.value   ?? '0')
  const minute  = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0')

  const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)
  const totalMinutes = hour * 60 + minute
  // NYSE regular session: 9:30 AM – 4:00 PM ET
  return isWeekday && totalMinutes >= 570 && totalMinutes < 960
}

interface MarketStatusProps {
  /** true = solo el dot (sidebar colapsado, mobile nav) */
  compact?: boolean
}

export function MarketStatus({ compact = false }: MarketStatusProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOpen(checkMarketOpen())

    // Re-check cada minuto
    const interval = setInterval(() => setOpen(checkMarketOpen()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const dot = (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full shrink-0',
        open ? 'bg-success-500' : 'bg-danger-500'
      )}
    />
  )

  if (compact) return dot

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {dot}
      <span className={cn('text-xs', open ? 'text-success-600' : 'text-gray-400')}>
        Mercado {open ? 'abierto' : 'cerrado'}
      </span>
    </div>
  )
}
