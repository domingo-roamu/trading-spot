import Link from 'next/link'
import { Clock, Target, BarChart3, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Logo } from '@/components/layout/Logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
            MVP en desarrollo activo
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl lg:text-6xl">
            Análisis semanal de trading
            <br />
            <span className="text-gray-400">impulsado por IA</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
            Reduce tu tiempo de research de{' '}
            <span className="font-semibold text-gray-700">4–6 horas</span> a{' '}
            <span className="font-semibold text-gray-700">menos de 1 hora</span> cada semana.
            Predicciones con nivel de confianza basadas en noticias y datos financieros reales.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              Ver cómo funciona
            </Link>
          </div>

          {/* Social proof mini */}
          <p className="mt-6 text-sm text-gray-400">
            Sin tarjeta de crédito · Setup en 2 minutos
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-bold tabular-nums text-gray-800">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-800">
              Todo lo que necesitas para operar mejor
            </h2>
            <p className="mt-4 text-gray-500">Sin complicaciones. Sin ruido. Solo lo que importa.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-card"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-gray-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-800">
              Tu flujo semanal con Trading Spot
            </h2>
            <p className="mt-4 text-gray-500">Cuatro pasos simples, cada semana.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-5 hidden h-px w-full bg-gray-200 md:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white font-mono text-sm font-bold text-gray-600">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits list */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-gray-800">
              ¿Por qué Trading Spot?
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-200 bg-gray-900 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            ¿Listo para operar con más inteligencia?
          </h2>
          <p className="mt-4 text-gray-400">Comienza gratis. Sin tarjeta de crédito.</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-all hover:bg-gray-100"
          >
            Crear cuenta gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo inverted />
            <p className="text-xs text-gray-500">
              No es consejo financiero. Solo para uso personal y educativo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const stats = [
  { value: '<1h', label: 'Review semanal' },
  { value: '5–8', label: 'Instrumentos por semana' },
  { value: '>50%', label: 'Accuracy de predicciones' },
  { value: '$0', label: 'Costo de infraestructura' },
]

const features = [
  {
    icon: TrendingUp,
    title: 'Análisis Semanal con IA',
    description:
      'Claude analiza noticias y datos financieros de tus instrumentos cada domingo. Predicciones con nivel de confianza alto, medio o bajo.',
  },
  {
    icon: Clock,
    title: 'Review en 1 hora',
    description:
      'Revisa 5–8 instrumentos con análisis completo cada lunes en menos de 1 hora, en lugar de 4–6 horas de research manual.',
  },
  {
    icon: Target,
    title: 'Tracking Real de Operaciones',
    description:
      'Registra compras y ventas con comisiones incluidas. P&L neto automático y validación de si las predicciones fueron correctas.',
  },
  {
    icon: BarChart3,
    title: 'Métricas y Performance',
    description:
      'Dashboard con rentabilidad, win rate y accuracy del agente. Drill-down por instrumento para entender qué funciona.',
  },
] as const

const steps = [
  {
    title: 'Domingo',
    description: 'Recibes el reporte semanal por email con todos tus instrumentos analizados.',
  },
  {
    title: 'Lunes AM',
    description: 'Reviews el dashboard en ~1 hora y registras las compras que decides hacer.',
  },
  {
    title: 'Viernes PM',
    description: 'Registras las ventas con precio y comisiones. El sistema calcula tu P&L neto.',
  },
  {
    title: 'Aprende',
    description:
      'Ves tus métricas, qué predicciones acertaron y ajustas tu estrategia semana a semana.',
  },
]

const benefits = [
  'Reduce tu tiempo de research de 4–6 horas a menos de 1 hora semanal',
  'Predicciones basadas en noticias reales y datos financieros actualizados',
  'Trackeo de comisiones para conocer tu rentabilidad neta real',
  'Historial completo con drill-down por instrumento',
  'Métricas de accuracy para saber qué tan confiable es el agente',
  'Soporte en español e inglés (ES/EN)',
  'Diseñado para estrategia compra-lunes / vende-viernes',
  'Costo de infraestructura: $0 (APIs gratuitas + Supabase free tier)',
]
