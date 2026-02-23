'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction } from '@/lib/auth/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, null)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bienvenido de vuelta</h1>
        <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para continuar.</p>
      </div>

      {state?.error && (
        <div className="mb-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tenés acceso?{' '}
        <Link href="/signup" className="font-medium text-gray-900 hover:underline">
          Lista de espera
        </Link>
      </p>
    </div>
  )
}
