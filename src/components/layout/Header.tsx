import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Trading Spot - Inicio">
            <Logo />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-gray-500 transition-colors hover:text-gray-800"
            >
              Características
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-gray-500 transition-colors hover:text-gray-800"
            >
              Cómo funciona
            </Link>
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-md"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
