import EventForm from '@/components/EventForm'
import { requireOrganizer } from '@/lib/auth'
import { londonDate } from '@/lib/weekend'

export const metadata = { title: 'Create Event – Weekendr' }

function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default async function CreateEventPage() {
  const { profile, email } = await requireOrganizer('/create-event')

  // Default to the coming Saturday (or today, if it's Saturday).
  const today = londonDate(new Date())
  const weekday = new Date(today + 'T12:00:00Z').getUTCDay()
  const nextSaturday = addDays(today, (6 - weekday + 7) % 7)

  return (
    <EventForm
      userId={profile!.id}
      defaultHostName={profile?.full_name || email?.split('@')[0] || ''}
      defaultDate={nextSaturday}
      minDate={today}
      maxDate={addDays(today, 365)}
    />
  )
}
