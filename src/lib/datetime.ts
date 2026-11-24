// Converts between London wall-clock time ("2026-11-21" + "19:30") and real instants,
// handling the switch between GMT and BST correctly.
import { APP_TIME_ZONE } from './format'

function londonParts(ms: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(ms))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), mi: get('minute') }
}

/** How far London's clock is ahead of UTC at a given moment, in ms. */
function londonOffset(ms: number) {
  const p = londonParts(ms)
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi) - Math.floor(ms / 60000) * 60000
}

/** "2026-11-21" + "19:30" (London time) → Date, or null if invalid. */
export function londonToDate(date: string, time: string): Date | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const tm = /^(\d{2}):(\d{2})$/.exec(time)
  if (!dm || !tm) return null
  const [y, mo, d, h, mi] = [+dm[1], +dm[2], +dm[3], +tm[1], +tm[2]]
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null
  const wall = Date.UTC(y, mo - 1, d, h, mi)
  let ms = wall - londonOffset(wall)
  ms = wall - londonOffset(ms) // second pass settles the GMT/BST boundary
  const check = londonParts(ms)
  if (check.y !== y || check.mo !== mo || check.d !== d) return null // e.g. 31 February
  return new Date(ms)
}

/** Date → { date: "2026-11-21", time: "19:30" } in London time (for filling form fields). */
export function dateToLondon(d: Date): { date: string; time: string } {
  const p = londonParts(d.getTime())
  const pad = (n: number) => String(n).padStart(2, '0')
  return { date: `${p.y}-${pad(p.mo)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.mi)}` }
}
