// Works out "this weekend" (Fri, Sat, Sun) in London time.
import { APP_TIME_ZONE } from './format'

export type DayKey = 'fri' | 'sat' | 'sun'

export interface WeekendDay {
  key: DayKey
  label: string // "Fri"
  dateLabel: string // "Nov 20"
  isoDate: string // "2026-11-20" (London calendar date)
}

/** London calendar date of a moment, as "YYYY-MM-DD". */
export function londonDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * The upcoming weekend. Mon–Thu: the next Fri–Sun. Fri–Sun: the current one.
 * Also returns which day to highlight first and a UTC window wide enough to query.
 */
export function getWeekend(now = new Date()) {
  const today = londonDate(now)
  const weekday = new Date(today + 'T12:00:00Z').getUTCDay() // 0 = Sun … 6 = Sat
  const daysSinceFriday = (weekday + 2) % 7 // Fri = 0, Sat = 1, Sun = 2, Mon = 3 …
  const friday = daysSinceFriday <= 2 ? addDays(today, -daysSinceFriday) : addDays(today, 7 - daysSinceFriday)

  const keys: DayKey[] = ['fri', 'sat', 'sun']
  const days: WeekendDay[] = keys.map((key, i) => {
    const isoDate = addDays(friday, i)
    return {
      key,
      isoDate,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      dateLabel: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
        new Date(isoDate + 'T12:00:00Z'),
      ),
    }
  })

  const todayKey = days.find((d) => d.isoDate === today)?.key ?? null

  return {
    days,
    todayKey,
    // Pad by a day either side; events are bucketed by their exact London date afterwards.
    queryFrom: addDays(friday, -1) + 'T00:00:00Z',
    queryTo: addDays(friday, 4) + 'T00:00:00Z',
  }
}
