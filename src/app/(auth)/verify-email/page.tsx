'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resendVerificationAction } from '@/lib/auth/actions'

function ResendButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Reenviando…' : 'Reenviar email de verificación'}
    </button>
  )
}

export default function VerifyEmailPage() {
  const [state, formAction] = useFormState(resendVerificationAction, null)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">Revisa tu bandeja de entrada</h1>
      <p className="text-sm text-gray-500 mb-1">
        Te enviamos un email de confirmación a:
      </p>
      {email && (
        <p className="text-sm font-medium text-gray-900 mb-6">{email}</p>
      )}
      <p className="text-sm text-gray-500 mb-6">
        Haz clic en el enlace del email para activar tu cuenta y acceder al dashboard.
      </p>

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

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <ResendButton />
      </form>

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
