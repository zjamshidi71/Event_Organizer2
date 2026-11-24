'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { londonToDate } from '@/lib/datetime'
import { isSupabaseConfigured, supabaseUrl } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { AgeGroup, Category, Database } from '@/types/database'

export type EventFormState = {
  error?: string
  /** Field name → message, shown next to the field. */
  fieldErrors?: Record<string, string>
} | undefined

const CATEGORIES: Category[] = ['music', 'sports', 'arts', 'volunteer', 'food', 'workshops', 'meetup']
const AGE_GROUPS: AgeGroup[] = ['all', '16-18', '18-24']
const MAX_PRICE_PENCE = 50000 // £500
const MAX_DAYS_AHEAD = 366

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim()

export async function saveEvent(_prev: EventFormState, form: FormData): Promise<EventFormState> {
  if (!isSupabaseConfigured) return { error: 'The app is not connected to Supabase yet.' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/create-event')

  const intent = form.get('intent') === 'draft' ? 'draft' : 'publish'
  const errors: Record<string, string> = {}

  // ── Basics ──────────────────────────────────────────────
  const title = text(form, 'title')
  if (title.length < 3 || title.length > 70) errors.title = 'Give your event a title (3–70 characters).'

  const description = text(form, 'description')
  if (description.length > 2000) errors.description = 'Keep the description under 2,000 characters.'

  const hostName = text(form, 'host_name')
  if (hostName.length < 2 || hostName.length > 60) errors.host_name = 'Add the host or organisation name (2–60 characters).'

  const categories = form.getAll('categories').map(String).filter((c): c is Category => CATEGORIES.includes(c as Category))
  if (categories.length === 0) errors.categories = 'Pick at least one category.'

  // ── Cover image (must be one this user uploaded to our storage) ───
  const imageUrl = text(form, 'image_url')
  const ownImagePrefix = `${supabaseUrl}/storage/v1/object/public/event-images/${user.id}/`
  if (imageUrl && !imageUrl.startsWith(ownImagePrefix)) errors.image_url = 'Please upload the cover photo again.'

  // ── When ────────────────────────────────────────────────
  const date = text(form, 'date')
  const startsAt = londonToDate(date, text(form, 'start_time'))
  let endsAt: Date | null = null
  if (!startsAt) {
    errors.when = 'Choose a valid date and start time.'
  } else {
    const now = Date.now()
    if (startsAt.getTime() < now + 5 * 60 * 1000) errors.when = 'The start time needs to be in the future.'
    else if (startsAt.getTime() > now + MAX_DAYS_AHEAD * 86400000) errors.when = 'Events can be listed up to a year ahead.'

    const endTime = text(form, 'end_time')
    if (endTime) {
      endsAt = londonToDate(date, endTime)
      if (!endsAt) errors.when = 'Choose a valid end time.'
      // An end time earlier than the start means it finishes after midnight.
      else if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + 86400000)
      if (endsAt && endsAt.getTime() - startsAt.getTime() > 24 * 3600000) errors.when = 'Events can last up to 24 hours.'
    }
  }

  // ── Where ───────────────────────────────────────────────
  const venue = text(form, 'venue')
  if (venue.length < 3 || venue.length > 200) errors.venue = 'Add the venue or address.'
  const area = text(form, 'area')
  if (area.length > 40) errors.area = 'Keep the area short, e.g. "Hackney, E8".'

  // ── Capacity & tickets ─────────────────────────────────
  const capacity = Number(form.get('capacity'))
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) errors.capacity = 'Capacity must be between 1 and 10,000.'

  const ticketType = form.get('ticket_type') === 'paid' ? 'paid' : 'free'
  let pricePence = 0
  if (ticketType === 'paid') {
    const raw = text(form, 'price').replace(/^£/, '')
    const pounds = /^\d+(\.\d{1,2})?$/.test(raw) ? Number(raw) : NaN
    pricePence = Math.round(pounds * 100)
    if (!Number.isFinite(pounds) || pricePence < 50 || pricePence > MAX_PRICE_PENCE) {
      errors.price = 'Enter a price between £0.50 and £500, e.g. 10 or 7.50.'
    }
  }

  const perk = text(form, 'perk')
  if (perk.length > 30) errors.perk = 'Keep the perk under 30 characters.'

  // ── Age & safety ────────────────────────────────────────
  const ageGroup = AGE_GROUPS.find((a) => a === form.get('age_group')) ?? 'all'
  const verifiedHostOnsite = form.get('verified_host_onsite') === 'on'
  const safeSpaceAccepted = form.get('safe_space_accepted') === 'on'
  if (intent === 'publish' && !safeSpaceAccepted) errors.safety = 'Accept the safe space guidelines to publish.'

  if (Object.keys(errors).length > 0) {
    return { error: 'Please fix the highlighted fields.', fieldErrors: errors }
  }

  const row: Database['public']['Tables']['events']['Insert'] = {
    title,
    description: description || null,
    host_name: hostName,
    categories,
    image_url: imageUrl || null,
    starts_at: startsAt!.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    venue,
    area: area || null,
    show_exact_location: form.get('show_exact_location') === 'on',
    capacity,
    ticket_type: ticketType,
    price_pence: pricePence,
    age_group: ageGroup,
    verified_host_onsite: verifiedHostOnsite,
    safe_space_accepted: safeSpaceAccepted,
    perk: perk || null,
    status: intent === 'draft' ? 'draft' : 'published',
  }

  const { data, error } = await supabase.from('events').insert(row).select('id').single()
  if (error || !data) {
    console.error('Failed to save event:', error)
    if (error?.code === '42501') {
      return { error: 'Only organizer accounts can create events. Switch to an organizer account on your profile page.' }
    }
    return { error: 'Your event couldn’t be saved. Please try again.' }
  }

  revalidatePath('/home')
  redirect(`/events/${data.id}?${intent === 'draft' ? 'draft' : 'created'}=1`)
}
