import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient(): SupabaseClient<Database> {
  const cookieStore = cookies()

  // Cast needed: SSR 0.3.0 passes 3 type args to SupabaseClient, but supabase-js 2.97.0
  // has 5 type params — args misalign causing Schema=never. Explicit return type fixes it.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // setAll desde Server Component — ignorar si hay middleware manejando sesiones
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignorar en Server Components
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>
}
