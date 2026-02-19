import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsSection } from '@/components/dashboard/SettingsSection'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type ReportRun   = Database['public']['Tables']['report_generations']['Row']

export const metadata = { title: 'Configuración — Trading Spot' }

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // User profile
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as UserProfile | null
  if (!profile) redirect('/onboarding')

  // Report generations (readable by all authenticated users via RLS policy)
  const { data: runsData } = await supabase
    .from('report_generations')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(20)

  const allRuns = (runsData ?? []) as ReportRun[]

  // Monthly aggregates (current month)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthlyRuns = allRuns.filter((r) => r.completed_at && r.completed_at >= monthStart)

  const monthlyAnalyses = monthlyRuns.reduce((s, r) => s + r.successful_analyses, 0)
  const monthlyCost     = monthlyRuns.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0)
  const totalAnalyses   = allRuns.reduce((s, r) => s + r.successful_analyses, 0)
  const totalCost       = allRuns.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestiona tu perfil, preferencias y cuenta</p>
      </div>

      <SettingsSection
        profile={profile}
        email={user.email ?? ''}
        recentRuns={allRuns}
        monthlyCost={monthlyCost}
        monthlyAnalyses={monthlyAnalyses}
        totalCost={totalCost}
        totalAnalyses={totalAnalyses}
      />
    </div>
  )
}
