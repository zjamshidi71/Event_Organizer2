import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import WeekendPlanner from '@/components/WeekendPlanner'
import { isAiConfigured } from '@/lib/ai/openrouter'
import { MAX_AGE, MIN_AGE } from '@/lib/ai/planner-types'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plan my weekend – Weekendr' }

export default async function PlanPage() {
  const { profile } = await requireUser('/plan')
  const guessedAge = profile?.birth_year ? new Date().getFullYear() - profile.birth_year : null
  const defaultAge = guessedAge && guessedAge >= MIN_AGE && guessedAge <= MAX_AGE ? guessedAge : null

  return (
    <>
      <TopBar />
      <main className="flex-1 pt-20 pb-28 px-margin max-w-lg mx-auto w-full flex flex-col gap-4">
        <div>
          <p className="font-inter text-label-sm text-primary uppercase tracking-wider">AI Weekend Planner</p>
          <h1 className="font-jakarta text-headline-xl-mobile text-on-surface">Plan my weekend</h1>
          <p className="font-jakarta text-body-md text-on-surface-variant mt-1">
            Tell us what you’re into. Five AI agents search this weekend’s events, check they suit you, and build a plan that fits your time and budget.
          </p>
        </div>
        {isAiConfigured ? (
          <WeekendPlanner defaultAge={defaultAge} />
        ) : (
          <p role="status" className="p-4 rounded-2xl bg-surface-container-high font-inter text-body-md text-on-surface-variant">
            The planner isn’t switched on yet. (Site owner: add an OpenRouter API key – see supabase/README.md.)
          </p>
        )}
      </main>
      <BottomNav />
    </>
  )
}
