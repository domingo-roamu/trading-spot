'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Radar,
  BarChart2,
  Settings,
} from 'lucide-react'
import { MarketStatus } from '@/components/dashboard/MarketStatus'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Inicio',   href: '/dashboard' },
  { icon: TrendingUp,      label: 'Trades',   href: '/dashboard/trades' },
  { icon: Radar,           label: 'Radar',    href: '/dashboard/radar' },
  { icon: BarChart2,       label: 'Analytics',href: '/dashboard/analytics' },
  { icon: Settings,        label: 'Config',   href: '/dashboard/settings' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
              isActive ? 'text-gray-900' : 'text-gray-400'
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
      {/* Market status dot — top-right corner */}
      <div className="absolute top-1.5 right-2">
        <MarketStatus compact />
      </div>
    </nav>
  )
}
