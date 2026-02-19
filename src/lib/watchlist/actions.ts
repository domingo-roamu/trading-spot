'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type WatchlistState = { error?: string; success?: boolean } | null

const TICKER_REGEX = /^[A-Z0-9.^/\-]{1,10}$/i
const MAX_WATCHLIST_SIZE = 20

export async function addToWatchlistAction(
  _prevState: WatchlistState,
  formData: FormData
): Promise<WatchlistState> {
  const ticker = (formData.get('ticker') as string)?.trim().toUpperCase()
  const name   = (formData.get('name') as string)?.trim() || null
  const sectorRaw = (formData.get('sector') as string)?.trim()
  const VALID_SECTORS = ['tech', 'health', 'etf', 'commodities', 'other']
  const sector = VALID_SECTORS.includes(sectorRaw) ? sectorRaw as 'tech' | 'health' | 'etf' | 'commodities' | 'other' : null

  if (!ticker) {
    return { error: 'El ticker es obligatorio.' }
  }
  if (!TICKER_REGEX.test(ticker)) {
    return { error: 'Ticker inválido. Usa letras, números y . ^ / - (máx 10 caracteres).' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado.' }
  }

  // Check watchlist size
  const { count } = await supabase
    .from('watchlist')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= MAX_WATCHLIST_SIZE) {
    return { error: `Máximo ${MAX_WATCHLIST_SIZE} instrumentos en watchlist.` }
  }

  const { error } = await supabase.from('watchlist').insert({
    user_id: user.id,
    ticker,
    name,
    sector,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: `${ticker} ya está en tu watchlist.` }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeFromWatchlistAction(
  _prevState: WatchlistState,
  formData: FormData
): Promise<WatchlistState> {
  const ticker = formData.get('ticker') as string

  if (!ticker) {
    return { error: 'Ticker no especificado.' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado.' }
  }

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('ticker', ticker)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
