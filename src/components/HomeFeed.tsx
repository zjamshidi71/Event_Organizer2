'use client'

import { useEffect, useMemo, useState } from 'react'
import EventCard from '@/components/EventCard'
import { CATEGORY_META } from '@/lib/categories'
import { londonDate, type DayKey, type WeekendDay } from '@/lib/weekend'
import type { Category, EventRecord } from '@/types/database'

type Filter = 'all' | 'free' | Category

const FILTERS: { key: Filter; emoji: string; label: string }[] = [
  { key: 'all', emoji: '⚡', label: 'All' },
  { key: 'music', ...CATEGORY_META.music },
  { key: 'sports', ...CATEGORY_META.sports },
  { key: 'arts', ...CATEGORY_META.arts },
  { key: 'volunteer', ...CATEGORY_META.volunteer },
  { key: 'free', emoji: '🎟️', label: 'Free' },
  { key: 'food', ...CATEGORY_META.food },
  { key: 'workshops', ...CATEGORY_META.workshops },
  { key: 'meetup', ...CATEGORY_META.meetup },
]

// Until accounts arrive (Step 4–5), saved events are remembered on this device only.
const SAVED_KEY = 'weekendr:saved-events'

interface HomeFeedProps {
  days: WeekendDay[]
  initialDay: DayKey
  events: EventRecord[]
  error: string | null
}

export default function HomeFeed({ days, initialDay, events, error }: HomeFeedProps) {
  const [activeDay, setActiveDay] = useState<DayKey>(initialDay)
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY)
      if (raw) setSaved(new Set(JSON.parse(raw) as string[]))
    } catch {
      // Storage unavailable (private mode etc.) – hearts just won't persist.
    }
  }, [])

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // Group events by weekend day once.
  const eventsByDay = useMemo(() => {
    const map: Record<DayKey, EventRecord[]> = { fri: [], sat: [], sun: [] }
    for (const event of events) {
      const day = days.find((d) => d.isoDate === londonDate(new Date(event.starts_at)))
      if (day) map[day.key].push(event)
    }
    return map
  }, [events, days])

  const visible = eventsByDay[activeDay].filter((e) =>
    activeFilter === 'all' ? true : activeFilter === 'free' ? e.ticket_type === 'free' : e.categories.includes(activeFilter),
  )

  const goingThisWeekend = events.reduce((sum, e) => sum + e.rsvp_count, 0)
  const busiestDay = (Object.keys(eventsByDay) as DayKey[]).reduce((a, b) =>
    eventsByDay[b].length > eventsByDay[a].length ? b : a,
  )
  const activeIndex = days.findIndex((d) => d.key === activeDay)
  const nextDay = days[activeIndex + 1]
  const activeDayName = { fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }[activeDay]

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Weekend day selector */}
      <section className="px-margin pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-inter text-label-sm text-primary uppercase tracking-wider mb-0.5">London Happening Now</p>
            <h1 className="font-jakarta text-headline-xl-mobile text-on-surface tracking-tight">This Weekend</h1>
          </div>
          <span className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface shadow-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
            <span className="font-inter text-label-md">London</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {days.map((day) => {
            const active = day.key === activeDay
            const count = eventsByDay[day.key].length
            const isPeak = day.key === busiestDay && count > 0
            return (
              <button
                key={day.key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveDay(day.key)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all active:scale-[0.98] ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-lg shadow-primary-container/25 scale-[1.02]'
                    : 'bg-surface-container-lowest shadow-sm text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {active && isPeak && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary-container flex items-center justify-center ring-2 ring-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface" />
                  </span>
                )}
                <span className={`font-inter text-label-sm uppercase tracking-wider ${active ? 'text-on-primary-container' : 'text-outline'}`}>
                  {day.label}
                </span>
                <span className={`font-jakarta text-title-md font-bold mt-0.5 ${active ? 'text-on-primary' : 'text-on-surface'}`}>
                  {day.dateLabel}
                </span>
                <span className={`font-inter text-[10px] mt-0.5 ${active ? 'text-on-primary font-semibold' : 'text-outline'}`}>
                  {isPeak ? 'Peak Vibes' : `${count} ${count === 1 ? 'Event' : 'Events'}`}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Category chips */}
      <section className="mt-2 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto px-margin no-scrollbar py-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-inter text-label-md shadow-sm active:scale-95 transition-all flex items-center gap-1.5 ${
                activeFilter === f.key
                  ? 'bg-on-background text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="px-margin flex flex-col gap-4">
        {error ? (
          <div role="alert" className="p-4 rounded-2xl bg-error-container text-on-error-container flex gap-3">
            <span className="material-symbols-outlined">error</span>
            <div>
              <p className="font-jakarta text-title-md">Events couldn&apos;t be loaded</p>
              <p className="font-inter text-body-md mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {goingThisWeekend > 0 && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                  <p className="font-jakarta text-body-md text-on-surface">
                    <span className="font-bold text-primary">{goingThisWeekend} peers</span> going out this weekend
                  </p>
                </div>
                <span className="font-inter text-label-sm text-primary font-bold">Trending</span>
              </div>
            )}

            {visible.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                large={i === 0 && event.is_featured}
                saved={saved.has(event.id)}
                onToggleSave={() => toggleSave(event.id)}
              />
            ))}

            {visible.length === 0 && (
              <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-outline text-[36px]">event_busy</span>
                <p className="font-jakarta text-title-md text-on-surface">No events here yet</p>
                <p className="font-inter text-body-md text-on-surface-variant max-w-xs">
                  {activeFilter === 'all'
                    ? `Nothing is listed for ${activeDayName} so far. Check another day, or host your own!`
                    : 'Try another category or another day.'}
                </p>
                {activeFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="mt-1 px-5 py-2.5 rounded-full bg-surface-container-highest text-primary font-inter text-label-md font-bold"
                  >
                    Show all categories
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      {!error && visible.length > 0 && (
        <section className="mt-6 px-margin text-center">
          <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <h3 className="font-jakarta text-title-md text-on-surface font-bold">That&apos;s your {activeDayName} lineup!</h3>
            <p className="font-jakarta text-body-md text-on-surface-variant max-w-xs">
              New youth-organized pop-ups and student gigs are added all the time.
            </p>
            {nextDay && (
              <button
                type="button"
                onClick={() => {
                  setActiveDay(nextDay.key)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="mt-1 px-5 py-2.5 rounded-full bg-surface-container-highest text-primary font-inter text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
              >
                Check {nextDay.key === 'sat' ? 'Saturday' : 'Sunday'} Lineup
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
