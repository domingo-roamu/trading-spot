import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        user={{
          email: user.email!,
          fullName: profile?.full_name ?? null,
        }}
      />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  )
}
