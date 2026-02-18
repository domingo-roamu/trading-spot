'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { completeOnboardingAction, type OnboardingState } from '@/lib/onboarding/actions'
import { cn } from '@/lib/utils'
import type { SectorType, LanguageType } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────────────────────

const SECTORS: { value: SectorType; label: string }[] = [
  { value: 'tech', label: 'Tech' },
  { value: 'health', label: 'Salud / Biotech' },
  { value: 'etf', label: 'ETFs' },
  { value: 'commodities', label: 'Materias Primas' },
  { value: 'other', label: 'Otros' },
]

const TICKER_REGEX = /^[A-Z0-9.^/-]{1,10}$/i
const MAX_TICKERS = 5

// ─── Submit Button ────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Guardando...' : 'Finalizar'}
    </button>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              n < current
                ? 'bg-gray-900 text-white'
                : n === current
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-400'
            )}
          >
            {n < current ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7L5.5 10.5L12 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              n
            )}
          </div>
          {i < 2 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-1 transition-colors',
                n < current ? 'bg-gray-900' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [state, formAction] = useFormState<OnboardingState, FormData>(
    completeOnboardingAction,
    null
  )

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fullName, setFullName] = useState('')
  const [language, setLanguage] = useState<LanguageType>('es')
  const [sectors, setSectors] = useState<SectorType[]>([])
  const [weeklyGoal, setWeeklyGoal] = useState('1.5')
  const [tickers, setTickers] = useState<string[]>([])
  const [tickerInput, setTickerInput] = useState('')
  const [tickerError, setTickerError] = useState('')

  const tickerInputRef = useRef<HTMLInputElement>(null)

  function toggleSector(sector: SectorType) {
    setSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    )
  }

  function addTicker() {
    const value = tickerInput.trim().toUpperCase()
    setTickerError('')

    if (!value) return

    if (!TICKER_REGEX.test(value)) {
      setTickerError('Ticker inválido. Usa letras, números o . ^ / - (máx 10 caracteres).')
      return
    }
    if (tickers.includes(value)) {
      setTickerError('Este ticker ya está en tu lista.')
      return
    }
    if (tickers.length >= MAX_TICKERS) {
      setTickerError(`Máximo ${MAX_TICKERS} instrumentos en el onboarding.`)
      return
    }

    setTickers((prev) => [...prev, value])
    setTickerInput('')
    tickerInputRef.current?.focus()
  }

  function removeTicker(ticker: string) {
    setTickers((prev) => prev.filter((t) => t !== ticker))
  }

  function handleTickerKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTicker()
    }
  }

  return (
    <form action={formAction}>
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      {/* Hidden inputs — always present so formData has all state on submit */}
      <input type="hidden" name="full_name" value={fullName} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="weekly_goal_pct" value={weeklyGoal} />
      {sectors.map((s) => (
        <input key={s} type="hidden" name="preferred_sectors" value={s} />
      ))}
      {tickers.map((t) => (
        <input key={t} type="hidden" name="ticker" value={t} />
      ))}

      <StepIndicator current={step} />

      {/* ── Step 1: Perfil ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">¡Bienvenido a Trading Spot!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Vamos a configurar tu cuenta en 3 pasos rápidos.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tu nombre <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Idioma</label>
              <div className="flex gap-2">
                {(['es', 'en'] as LanguageType[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors border',
                      language === lang
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                    )}
                  >
                    {lang === 'es' ? 'Español' : 'English'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-8 w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ── Step 2: Preferencias ───────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-6">¿Qué sectores te interesan?</h1>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSector(value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium border transition-colors',
                    sectors.includes(value)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta semanal de rentabilidad
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  step="0.1"
                  min="0.1"
                  max="20"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors pr-8"
                />
                <span className="absolute right-3.5 text-sm text-gray-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Instrumentos ───────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Agrega tus primeros instrumentos
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Escribe el ticker y presiona Enter o haz clic en Agregar.
          </p>

          {/* Ticker input */}
          <div className="flex gap-2">
            <input
              ref={tickerInputRef}
              type="text"
              value={tickerInput}
              onChange={(e) => {
                setTickerInput(e.target.value)
                setTickerError('')
              }}
              onKeyDown={handleTickerKeyDown}
              placeholder="AAPL, TSLA, BTC-USD…"
              maxLength={10}
              className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
            />
            <button
              type="button"
              onClick={addTicker}
              className="bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Agregar
            </button>
          </div>

          {tickerError && (
            <p className="mt-1.5 text-xs text-red-500">{tickerError}</p>
          )}

          {/* Ticker chips */}
          {tickers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tickers.map((ticker) => (
                <span
                  key={ticker}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm"
                >
                  {ticker}
                  <button
                    type="button"
                    onClick={() => removeTicker(ticker)}
                    className="text-gray-400 hover:text-gray-700 transition-colors leading-none"
                    aria-label={`Eliminar ${ticker}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Error banner */}
          {state?.error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
              {state.error}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Atrás
            </button>
            <SubmitButton />
          </div>

          <div className="mt-4 text-center">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Continuar sin instrumentos
            </button>
          </div>
        </div>
      )}
    </div>
    </form>
  )
}
