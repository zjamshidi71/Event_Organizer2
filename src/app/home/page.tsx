import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import HomeFeed from '@/components/HomeFeed'
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
