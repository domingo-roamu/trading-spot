'use server'

import { createServiceClient } from '@/lib/supabase/service'

interface WaitlistState {
  success?: boolean
  error?: string
}

export async function joinWaitlistAction(
  _prevState: WaitlistState | null,
  formData: FormData
): Promise<WaitlistState> {
  const name = formData.get('name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const message = formData.get('message')?.toString().trim() || null

  if (!name || !email) {
    return { error: 'El nombre y el email son obligatorios.' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('waitlist_requests').insert({ name, email, message })

  if (error) {
    // Unique constraint violation = email ya registrado
    if (error.code === '23505') {
      return { error: 'Este email ya está en la lista de espera.' }
    }
    console.error('[joinWaitlistAction]', error.message)
    return { error: 'Ocurrió un error. Intentá de nuevo.' }
  }

  return { success: true }
}
