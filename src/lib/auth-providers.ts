// Asks Supabase which social log-in providers are switched on,
// so the app only shows buttons that will actually work.
import 'server-only'
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from '@/lib/supabase/config'

export const SOCIAL_PROVIDERS = ['google', 'github'] as const
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

export async function getEnabledProviders(): Promise<SocialProvider[]> {
  if (!isSupabaseConfigured) return []
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseKey },
      next: { revalidate: 300 }, // re-check every 5 minutes
    })
    if (!res.ok) return []
    const settings = (await res.json()) as { external?: Record<string, boolean> }
    return SOCIAL_PROVIDERS.filter((p) => settings.external?.[p] === true)
  } catch (err) {
    console.error('Could not read Supabase auth settings:', err)
    return []
  }
}
