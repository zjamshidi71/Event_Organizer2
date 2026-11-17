import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

// Shown while events load from the database.
export default function Loading() {
  return (
    <>
      <TopBar variant="home" city="London" />
      <main className="flex flex-col w-full pt-16 pb-24 min-h-screen px-margin" aria-busy="true" aria-label="Loading events">
        <div className="pt-4 h-12 w-48 rounded-xl bg-surface-container-high animate-pulse" />
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-4 mt-8">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
