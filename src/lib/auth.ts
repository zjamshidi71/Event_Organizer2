// Server-side helpers for the logged-in user.
import 'server-only'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/** Remembers "I'm hosting events" across the Google/GitHub log-in round trip (read in /auth/confirm). */
export const SIGNUP_ROLE_COOKIE = 'weekendr_signup_role'

/** Only allow redirects to pages on this site (prevents "open redirect" tricks). */
export function safeNext(next: unknown, fallback = '/home'): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : fallback
}

export async function getCurrentUser(): Promise<{ email: string | null; profile: Profile | null } | null> {
  if (!isSupabaseConfigured) return null
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  return { email: user.email ?? null, profile }
}

/** Use in a server layout/page: sends visitors who aren't logged in to /login. */
export async function requireUser(nextPath: string) {
  const current = await getCurrentUser()
  if (!current) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  return current
}

/** Use in a server layout/page: only organizers may continue. */
export async function requireOrganizer(nextPath: string) {
  const current = await requireUser(nextPath)
  if (current.profile?.role !== 'organizer') redirect('/profile?notice=organizer-only')
  return current
}
