'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type ProfileState = { error?: string; success?: boolean } | null

export async function updateProfileAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const full_name = (formData.get('full_name') as string).trim() || null
  const language = formData.get('language') as string
  const weekly_goal_pct = parseFloat(formData.get('weekly_goal_pct') as string)
  const email_notifications = formData.get('email_notifications') === '1'
  const timezone = formData.get('timezone') as string

  if (!['es', 'en'].includes(language)) return { error: 'Idioma no válido' }
  if (isNaN(weekly_goal_pct) || weekly_goal_pct <= 0 || weekly_goal_pct > 100) {
    return { error: 'La meta semanal debe estar entre 0.1% y 100%' }
  }
  if (!timezone) return { error: 'Zona horaria requerida' }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      full_name,
      language: language as 'es' | 'en',
      weekly_goal_pct,
      email_notifications,
      timezone,
    })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function sendPasswordResetAction(): Promise<{
  error?: string
  success?: boolean
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No se pudo obtener el email del usuario' }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Service client required to delete from auth.users (bypasses RLS)
  const serviceClient = createServiceClient()
  const { error } = await serviceClient.auth.admin.deleteUser(user.id)

  if (error) return { error: error.message }

  await supabase.auth.signOut()
  return {}
}
