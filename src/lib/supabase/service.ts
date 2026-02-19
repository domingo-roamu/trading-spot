import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Service role client — bypasses RLS.
 * Use ONLY in server-side code (API routes, server actions).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createServiceClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
