'use client'

import { useState, useTransition } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Check, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  updateProfileAction,
  sendPasswordResetAction,
  deleteAccountAction,
  type ProfileState,
} from '@/lib/settings/actions'
import type { Database } from '@/types/database'

type UserProfile  = Database['public']['Tables']['user_profiles']['Row']
type ReportRun    = Database['public']['Tables']['report_generations']['Row']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCostUsd(value: number | null): string {
  if (value === null) return '—'
  if (value < 0.001) return '< $0.001'
  return `$${value.toFixed(4)}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TIMEZONES = [
  { value: 'America/Santiago',     label: 'Chile (Santiago)' },
  { value: 'America/Bogota',       label: 'Colombia (Bogotá)' },
  { value: 'America/Lima',         label: 'Perú (Lima)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Caracas',      label: 'Venezuela (Caracas)' },
  { value: 'America/Mexico_City',  label: 'México (Ciudad de México)' },
  { value: 'America/New_York',     label: 'EE.UU. (Nueva York)' },
  { value: 'America/Chicago',      label: 'EE.UU. (Chicago)' },
  { value: 'America/Los_Angeles',  label: 'EE.UU. (Los Ángeles)' },
  { value: 'Europe/Madrid',        label: 'España (Madrid)' },
  { value: 'UTC',                  label: 'UTC' },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-200 shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-5 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : null}
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  )
}

// ─── Section 1: Profile ───────────────────────────────────────────────────────

function ProfileSection({ profile }: { profile: UserProfile }) {
  const [state, formAction] = useFormState<ProfileState, FormData>(updateProfileAction, null)

  return (
    <Card>
      <CardHeader
        title="Perfil"
        subtitle="Información de tu cuenta y preferencias"
      />
      <form action={formAction} className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile.full_name ?? ''}
            placeholder="Tu nombre"
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1.5">
              Idioma
            </label>
            <select
              id="language"
              name="language"
              defaultValue={profile.language}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Weekly goal */}
          <div>
            <label htmlFor="weekly_goal_pct" className="block text-sm font-medium text-gray-700 mb-1.5">
              Meta semanal (%)
            </label>
            <input
              id="weekly_goal_pct"
              name="weekly_goal_pct"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              defaultValue={profile.weekly_goal_pct}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Zona horaria
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Notificaciones por email</p>
            <p className="text-xs text-gray-400">Recibe el análisis semanal en tu correo</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="email_notifications"
              value="1"
              defaultChecked={profile.email_notifications}
              className="sr-only peer"
            />
            <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-gray-900 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Feedback */}
        {state?.error && (
          <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-success-700 bg-success-50 border border-success-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <Check size={14} /> Cambios guardados
          </p>
        )}

        <div className="flex justify-end pt-1">
          <SaveButton />
        </div>
      </form>
    </Card>
  )
}

// ─── Section 2: AI Usage & Cost ───────────────────────────────────────────────

function UsageSection({
  recentRuns,
  monthlyCost,
  monthlyAnalyses,
  totalCost,
  totalAnalyses,
}: {
  recentRuns: ReportRun[]
  monthlyCost: number
  monthlyAnalyses: number
  totalCost: number
  totalAnalyses: number
}) {
  return (
    <Card>
      <CardHeader
        title="Uso de IA"
        subtitle="Historial de análisis generados con Claude Sonnet 4.6"
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Este mes</p>
            <p className="text-2xl font-semibold text-gray-900">{monthlyAnalyses}</p>
            <p className="text-xs text-gray-500 mt-0.5">análisis</p>
            <p className="text-sm font-mono font-medium text-gray-700 mt-2">
              {formatCostUsd(monthlyCost || null)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Total acumulado</p>
            <p className="text-2xl font-semibold text-gray-900">{totalAnalyses}</p>
            <p className="text-xs text-gray-500 mt-0.5">análisis</p>
            <p className="text-sm font-mono font-medium text-gray-700 mt-2">
              {formatCostUsd(totalCost || null)}
            </p>
          </div>
        </div>

        {/* Pricing note */}
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">Referencia de precios · Claude Sonnet 4.6</p>
          <div className="grid grid-cols-2 gap-x-4">
            <span>Tokens entrada: <span className="font-mono">$3 / 1M tok</span></span>
            <span>Tokens salida: <span className="font-mono">$15 / 1M tok</span></span>
          </div>
          <p className="text-gray-400">Costo estimado por análisis: ~$0.04 · 5 tickers/semana: ~$0.80/mes</p>
        </div>

        {/* Recent runs table */}
        {recentRuns.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Últimas ejecuciones</p>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-400">
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-right font-medium">Tickers</th>
                    <th className="px-3 py-2 text-right font-medium">OK</th>
                    <th className="px-3 py-2 text-right font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRuns.slice(0, 8).map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-600">{formatDate(run.completed_at)}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{run.total_instruments}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={run.successful_analyses > 0 ? 'text-success-600' : 'text-gray-400'}>
                          {run.successful_analyses}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700">
                        {formatCostUsd(run.estimated_cost_usd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">
            Aún no hay análisis generados
          </p>
        )}
      </div>
    </Card>
  )
}

// ─── Section 3: Account ───────────────────────────────────────────────────────

function AccountSection({ email }: { email: string }) {
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [pwError, setPwError]   = useState('')
  const [, startTransition]     = useTransition()
  const router = useRouter()

  const handlePasswordReset = () => {
    setPwStatus('loading')
    startTransition(async () => {
      const result = await sendPasswordResetAction()
      if (result.error) {
        setPwStatus('error')
        setPwError(result.error)
      } else {
        setPwStatus('sent')
      }
    })
  }

  const handleDeleteAccount = () => {
    if (
      !confirm(
        '¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción es irreversible y borrará todos tus datos: trades, watchlist y análisis.'
      )
    ) return

    startTransition(async () => {
      const result = await deleteAccountAction()
      if (result.error) {
        alert(`Error al eliminar cuenta: ${result.error}`)
      } else {
        router.push('/login')
      }
    })
  }

  return (
    <Card>
      <CardHeader title="Cuenta" />
      <div className="p-6 space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <p className="text-sm text-gray-700 font-mono">{email}</p>
        </div>

        {/* Change password */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Contraseña</p>
            <p className="text-xs text-gray-400">Recibirás un email con el enlace de cambio</p>
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={pwStatus === 'loading' || pwStatus === 'sent'}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pwStatus === 'loading' ? 'Enviando...' :
             pwStatus === 'sent'    ? '✓ Email enviado' :
             'Cambiar contraseña'}
          </button>
        </div>

        {pwStatus === 'error' && (
          <p className="text-xs text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2">
            {pwError}
          </p>
        )}

        {/* Danger zone */}
        <div className="rounded-xl border border-danger-100 bg-danger-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-danger-500 shrink-0" />
            <p className="text-xs font-semibold text-danger-700">Zona de peligro</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Eliminar cuenta</p>
              <p className="text-xs text-gray-400">Borra todos tus datos de forma permanente</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-100 transition-colors"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface SettingsSectionProps {
  profile: UserProfile
  email: string
  recentRuns: ReportRun[]
  monthlyCost: number
  monthlyAnalyses: number
  totalCost: number
  totalAnalyses: number
}

export function SettingsSection({
  profile,
  email,
  recentRuns,
  monthlyCost,
  monthlyAnalyses,
  totalCost,
  totalAnalyses,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <ProfileSection profile={profile} />
      <UsageSection
        recentRuns={recentRuns}
        monthlyCost={monthlyCost}
        monthlyAnalyses={monthlyAnalyses}
        totalCost={totalCost}
        totalAnalyses={totalAnalyses}
      />
      <AccountSection email={email} />
    </div>
  )
}
