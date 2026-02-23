'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { joinWaitlistAction } from '@/lib/waitlist/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Enviando…' : 'Unirme a la lista'}
    </button>
  )
}

export default function WaitlistPage() {
  const [state, formAction] = useFormState(joinWaitlistAction, null)

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">¡Estás en la lista!</h2>
        <p className="text-sm text-gray-500">
          Te avisaremos por email cuando haya un lugar disponible.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-gray-900 hover:underline"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Lista de espera</h1>
        <p className="text-sm text-gray-500 mt-1">
          Trading Spot está en acceso limitado. Anotate y te avisamos cuando haya lugar.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
            ¿Por qué te interesa? <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Contanos un poco sobre vos…"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors resize-none"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tenés acceso?{' '}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
