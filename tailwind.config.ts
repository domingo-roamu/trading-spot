import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de grises principal del Design System
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Success (Verde sutil)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        // Danger (Rojo sutil)
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        // Warning (Amber)
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        // Info (Azul grisáceo)
        info: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          600: '#475569',
        },
        // Primary (Plateado con tinte azul)
        primary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
        },
        // Confianza (atajos semánticos)
        confidence: {
          high: '#22C55E',
          medium: '#F59E0B',
          low: '#EF4444',
        },
        // Tendencias
        trend: {
          up: '#22C55E',
          down: '#EF4444',
          sideways: '#A3A3A3',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'Courier New', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      spacing: {
        // Sistema de 8px
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(115, 115, 115, 0.1)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
