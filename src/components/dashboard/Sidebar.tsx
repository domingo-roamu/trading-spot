'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Eye,
  TrendingUp,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { Logo, LogoIcon } from '@/components/layout/Logo'
import { logoutAction } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

const SIDEBAR_KEY = 'ts_sidebar_collapsed'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: <Eye size={20} />,
    label: 'Watchlist',
    href: '/dashboard/watchlist',
    disabled: true,
  },
  {
    icon: <TrendingUp size={20} />,
    label: 'Trades',
    href: '/dashboard/trades',
  },
  {
    icon: <BarChart2 size={20} />,
    label: 'Analytics',
    href: '/dashboard/analytics',
    disabled: true,
  },
  {
    icon: <Settings size={20} />,
    label: 'Configuración',
    href: '/dashboard/settings',
  },
]

interface SidebarProps {
  user: {
    email: string
    fullName: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  // Start expanded to match SSR, then hydrate from localStorage
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(SIDEBAR_KEY, String(next))
  }

  const displayName = user.fullName || user.email
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col relative border-r border-gray-200 bg-white transition-all duration-200 ease-in-out shrink-0',
        mounted && collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Toggle button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-colors"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {mounted && collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-gray-100 shrink-0',
          mounted && collapsed ? 'justify-center px-0 py-4' : 'px-5 py-4'
        )}
      >
        {mounted && collapsed ? (
          <LogoIcon size={28} className="text-gray-900" />
        ) : (
          <Logo iconSize={28} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            if (item.disabled) {
              return (
                <li key={item.href}>
                  <span
                    title={mounted && collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-not-allowed',
                      'text-gray-300',
                      mounted && collapsed && 'justify-center px-0'
                    )}
                  >
                    {item.icon}
                    {(!mounted || !collapsed) && (
                      <span>{item.label}</span>
                    )}
                  </span>
                </li>
              )
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={mounted && collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                    mounted && collapsed && 'justify-center px-0'
                  )}
                >
                  {item.icon}
                  {(!mounted || !collapsed) && (
                    <span>{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-gray-100 p-3', mounted && collapsed && 'px-0')}>
        {mounted && collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold shrink-0">
              {initial}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              {user.fullName && (
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              )}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  )
}
