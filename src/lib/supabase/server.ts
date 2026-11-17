// Supabase client for Server Components, Route Handlers and Server Actions.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { assertSupabaseConfigured, supabaseKey, supabaseUrl } from './config'

export function createClient() {
  assertSupabaseConfigured()
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: session refresh will be handled by middleware (added with log-in in Step 4).
        }
      },
    },
  })
}
