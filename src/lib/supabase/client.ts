import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createClient(): SupabaseClient<Database> {
  // Cast needed: SSR 0.3.0 / supabase-js 2.97.0 type param mismatch (see server.ts)
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as SupabaseClient<Database>
}
