'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TradeState = { error?: string; success?: boolean } | null

const TICKER_REGEX = /^[A-Z0-9.^/\-]{1,10}$/i

export async function openTradeAction(
  _prevState: TradeState,
  formData: FormData
): Promise<TradeState> {
  const ticker = (formData.get('ticker') as string)?.trim().toUpperCase()
  const buyPriceRaw = formData.get('buy_price') as string
  const sharesRaw = formData.get('shares') as string
  const buyCommissionRaw = formData.get('buy_commission') as string
  const buyDateRaw = formData.get('buy_date') as string
  const predictedDirection = (formData.get('predicted_direction') as string) || null

  if (!ticker) return { error: 'El ticker es obligatorio.' }
  if (!TICKER_REGEX.test(ticker)) {
    return { error: 'Ticker inválido. Usa letras, números y . ^ / - (máx 10 caracteres).' }
  }

  const buy_price = parseFloat(buyPriceRaw)
  const shares = parseFloat(sharesRaw)
  const buy_commission = parseFloat(buyCommissionRaw) || 0

  if (isNaN(buy_price) || buy_price <= 0) return { error: 'El precio de compra debe ser mayor a 0.' }
  if (isNaN(shares) || shares <= 0) return { error: 'La cantidad de acciones debe ser mayor a 0.' }

  const buy_date = buyDateRaw || new Date().toISOString().split('T')[0]

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase.from('trades').insert({
    user_id: user.id,
    ticker,
    buy_price,
    shares,
    buy_commission,
    buy_date,
    predicted_direction: predictedDirection as 'up' | 'down' | 'sideways' | null,
    status: 'open',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/trades')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function closeTradeAction(
  _prevState: TradeState,
  formData: FormData
): Promise<TradeState> {
  const trade_id = formData.get('trade_id') as string
  const sellPriceRaw = formData.get('sell_price') as string
  const sellCommissionRaw = formData.get('sell_commission') as string
  const sellDateRaw = formData.get('sell_date') as string

  if (!trade_id) return { error: 'ID del trade no especificado.' }

  const sell_price = parseFloat(sellPriceRaw)
  const sell_commission = parseFloat(sellCommissionRaw) || 0

  if (isNaN(sell_price) || sell_price <= 0) return { error: 'El precio de venta debe ser mayor a 0.' }

  const sell_date = sellDateRaw || new Date().toISOString().split('T')[0]

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('trades')
    .update({
      sell_price,
      sell_commission,
      sell_date,
      status: 'closed',
    })
    .eq('id', trade_id)
    .eq('user_id', user.id)
    .eq('status', 'open')

  if (error) return { error: error.message }

  revalidatePath('/dashboard/trades')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTradeAction(
  _prevState: TradeState,
  formData: FormData
): Promise<TradeState> {
  const trade_id = formData.get('trade_id') as string

  if (!trade_id) return { error: 'ID del trade no especificado.' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', trade_id)
    .eq('user_id', user.id)
    .eq('status', 'open')

  if (error) return { error: error.message }

  revalidatePath('/dashboard/trades')
  revalidatePath('/dashboard')
  return { success: true }
}
