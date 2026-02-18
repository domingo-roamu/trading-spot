import type { Metadata } from 'next'
import { Nunito, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Trading Spot',
    template: '%s | Trading Spot',
  },
  description:
    'Plataforma de análisis de trading semanal con IA. Reduce tu tiempo de research de horas a minutos.',
  keywords: ['trading', 'análisis', 'IA', 'acciones', 'ETF', 'mercado'],
  authors: [{ name: 'Trading Spot' }],
  openGraph: {
    title: 'Trading Spot',
    description: 'Análisis semanal de trading impulsado por IA',
    type: 'website',
    locale: 'es_ES',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-screen bg-gray-50 text-gray-600">
        {children}
      </body>
    </html>
  )
}
