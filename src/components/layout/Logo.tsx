import { cn } from '@/lib/utils'

interface LogoIconProps {
  className?: string
  size?: number
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Círculo exterior */}
      <circle
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        cx="20"
        cy="20"
        r="15"
      />
      {/* Punto central */}
      <circle fill="currentColor" cx="20" cy="20" r="4" />
      {/* Puntos cardinales */}
      <circle fill="currentColor" cx="20" cy="8" r="1.5" />
      <circle fill="currentColor" cx="32" cy="20" r="1.5" />
      <circle fill="currentColor" cx="20" cy="32" r="1.5" />
      <circle fill="currentColor" cx="8" cy="20" r="1.5" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  iconSize?: number
  showText?: boolean
  inverted?: boolean
}

export function Logo({ className, iconSize = 32, showText = true, inverted = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoIcon
        size={iconSize}
        className={inverted ? 'text-white' : 'text-gray-900'}
      />
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            inverted ? 'text-white' : 'text-gray-900',
            iconSize >= 40 ? 'text-2xl' : 'text-lg'
          )}
        >
          Trading{' '}
          <span className={cn('font-semibold', inverted ? 'text-white/70' : 'text-gray-500')}>
            Spot
          </span>
        </span>
      )}
    </div>
  )
}
