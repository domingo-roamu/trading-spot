'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SectorType, LanguageType } from '@/types/database'

export type OnboardingState = { error?: string } | null

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No hay sesión activa.' }
  }

  const full_name = (formData.get('full_name') as string | null) || null
  const language = (formData.get('language') as LanguageType) || 'es'
  const weekly_goal_pct = parseFloat(formData.get('weekly_goal_pct') as string) || 1.5
  const preferred_sectors = formData.getAll('preferred_sectors') as SectorType[]
  const tickers = formData.getAll('ticker') as string[]

  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      full_name,
      language,
      weekly_goal_pct,
      preferred_sectors,
      onboarding_completed: true,
    })
    .eq('user_id', user.id)

  if (profileError) {
    return { error: 'Error al guardar tu perfil. Intenta nuevamente.' }
  }

  if (tickers.length > 0) {
    const items = tickers.map((ticker) => ({
      user_id: user.id,
      ticker: ticker.toUpperCase(),
    }))

    const { error: watchlistError } = await supabase
      .from('watchlist')
      .upsert(items, { onConflict: 'user_id,ticker', ignoreDuplicates: true })

    if (watchlistError) {
      console.error('Watchlist upsert error (non-blocking):', watchlistError)
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
