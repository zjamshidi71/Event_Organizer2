// Server-side data loading for events.
import 'server-only'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { EventRecord } from '@/types/database'
import { getWeekend, londonDate } from './weekend'

export type LoadResult<T> = { ok: true; data: T } | { ok: false; error: string }

const NOT_CONFIGURED =
  'The app is not connected to Supabase yet. Add the Supabase environment variables in Vercel and redeploy.'

export async function getWeekendEvents(now = new Date()) {
  const weekend = getWeekend(now)

  if (!isSupabaseConfigured) {
    return { weekend, result: { ok: false, error: NOT_CONFIGURED } as LoadResult<EventRecord[]> }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('starts_at', weekend.queryFrom)
    .lt('starts_at', weekend.queryTo)
    .order('is_featured', { ascending: false })
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('Failed to load weekend events:', error)
    return {
      weekend,
      result: { ok: false, error: 'Could not load events from the database.' } as LoadResult<EventRecord[]>,
    }
  }

  const weekendDates = new Set(weekend.days.map((d) => d.isoDate))
  const events = (data ?? []).filter((e) => weekendDates.has(londonDate(new Date(e.starts_at))))
  return { weekend, result: { ok: true, data: events } as LoadResult<EventRecord[]> }
}

export async function getEventById(id: string): Promise<LoadResult<EventRecord | null>> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED }
  // Reject anything that isn't a UUID before hitting the database.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: true, data: null }

  const supabase = createClient()
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.error('Failed to load event:', error)
    return { ok: false, error: 'Could not load this event from the database.' }
  }
  return { ok: true, data }
}
