'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { forgotPasswordAction, updatePasswordAction } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

function RequestResetForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, null)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500 mt-1">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 bg-success-50 border border-success-100 text-success-700 rounded-lg px-4 py-3 text-sm">
          {state.success}
        </div>
      )}

      {!state?.success && (
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
          <SubmitButton label="Enviar enlace" pendingLabel="Enviando…" />
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}

function UpdatePasswordForm() {
  const [state, formAction] = useFormState(updatePasswordAction, null)
  const [clientError, setClientError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

    if (password.length < 8) {
      e.preventDefault()
      setClientError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      e.preventDefault()
      setClientError('Las contraseñas no coinciden.')
      return
    }
    setClientError(null)
  }

  const error = clientError ?? state?.error

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nueva contraseña</h1>
        <p className="text-sm text-gray-500 mt-1">Elige una contraseña segura para tu cuenta.</p>
      </div>

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repite tu contraseña"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/10 focus:border-gray-600 transition-colors"
          />
        </div>

        <SubmitButton label="Actualizar contraseña" pendingLabel="Actualizando…" />
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
    })
  }, [])

  // Loading state while checking session
  if (hasSession === null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  return hasSession ? <UpdatePasswordForm /> : <RequestResetForm />
}
