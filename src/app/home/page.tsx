import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import HomeFeed from '@/components/HomeFeed'
import Link from 'next/link'
import { getWeekendEvents } from '@/lib/events'
import { londonDate, type DayKey } from '@/lib/weekend'

// Always load fresh events from the database.
export const dynamic = 'force-dynamic'

export default async function HomeFeedPage() {
  const { weekend, result } = await getWeekendEvents()
  const events = result.ok ? result.data : []

  // Open on today if it's the weekend; otherwise Saturday, unless only another day has events.
  const dayHasEvents = (key: DayKey) => {
    const iso = weekend.days.find((d) => d.key === key)!.isoDate
    return events.some((e) => londonDate(new Date(e.starts_at)) === iso)
  }
  const initialDay: DayKey =
    weekend.todayKey ?? (['sat', 'fri', 'sun'] as DayKey[]).find(dayHasEvents) ?? 'sat'

  return (
    <>
      <TopBar variant="home" city="London" />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <Link
          href="/plan"
          className="mx-margin mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md flex items-center gap-3 hover:shadow-lg transition-shadow"
        >
          <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <span className="flex-1">
            <span className="block font-jakarta text-title-md">Plan my weekend with AI</span>
            <span className="block font-inter text-label-md text-on-primary-container">Tell us your vibe and budget – get a plan in seconds</span>
          </span>
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
        <HomeFeed
          days={weekend.days}
          initialDay={initialDay}
          events={events}
          error={result.ok ? null : result.error}
        />
      </main>
      <BottomNav />
    </>
  )
}
