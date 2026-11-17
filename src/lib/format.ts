// Display helpers. Everything is shown in London time so the server and browser agree.
import type { EventRecord } from '@/types/database'

export const APP_TIME_ZONE = 'Europe/London'

export function formatPrice(event: Pick<EventRecord, 'ticket_type' | 'price_pence' | 'currency'>): string {
  if (event.ticket_type === 'free' || event.price_pence === 0) return 'Free'
  const amount = event.price_pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: event.currency || 'GBP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

/** "Sat 9:00 PM" */
export function formatDayTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\s?(am|pm)$/i, (m) => ' ' + m.trim().toUpperCase())
}

/** "9:00 PM" */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\s?(am|pm)$/i, (m) => ' ' + m.trim().toUpperCase())
}

/** "Saturday 21 November" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}

export function spotsLeft(event: Pick<EventRecord, 'capacity' | 'rsvp_count'>): number {
  return Math.max(event.capacity - event.rsvp_count, 0)
}

export function percentFull(event: Pick<EventRecord, 'capacity' | 'rsvp_count'>): number {
  return Math.min(100, Math.round((event.rsvp_count / event.capacity) * 100))
}

export function ageLabel(ageGroup: EventRecord['age_group']): string | null {
  if (ageGroup === '16-18') return 'Ages 16–18'
  if (ageGroup === '18-24') return 'Ages 18–24 · ID'
  return null
}
