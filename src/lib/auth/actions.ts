'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; success?: string } | null

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor completa todos los campos.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Por favor verifica tu email antes de iniciar sesión.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor completa todos los campos.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado. ¿Quieres iniciar sesión?' }
    }
    return { error: error.message }
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

export async function forgotPasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor ingresa tu email.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Revisa tu email para el enlace de recuperación.' }
}

export async function updatePasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password') as string

  if (!password || password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function resendVerificationAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email no encontrado.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Email reenviado. Revisa tu bandeja de entrada.' }
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
