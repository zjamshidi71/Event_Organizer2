'use client'
// Supabase client for Client Components (code that runs in the browser).
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { assertSupabaseConfigured, supabaseKey, supabaseUrl } from './config'

export function createClient() {
  assertSupabaseConfigured()
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
