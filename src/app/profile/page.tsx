import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { becomeOrganizer, logout } from '@/app/auth/actions'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Profile – Weekendr' }

const NOTICES: Record<string, { tone: 'info' | 'error'; text: string }> = {
  'organizer-only': { tone: 'info', text: 'That page is for event hosts. Switch to an organizer account below to start hosting.' },
  'password-updated': { tone: 'info', text: 'Your password has been updated.' },
  'update-failed': { tone: 'error', text: 'Something went wrong while updating your account. Please try again.' },
}

export default async function ProfilePage({ searchParams }: { searchParams: { notice?: string } }) {
  const { email, profile } = await requireUser('/profile')
  const name = profile?.full_name || email?.split('@')[0] || 'You'
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const isOrganizer = profile?.role === 'organizer'
  const notice = searchParams.notice ? NOTICES[searchParams.notice] : undefined
  const memberSince = profile
    ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
    : null

  return (
    <>
      <TopBar />
      <main className="flex-1 pt-20 pb-28 px-margin max-w-lg mx-auto w-full flex flex-col gap-4">
        {notice && (
          <p
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`p-3 rounded-xl font-inter text-body-md ${
              notice.tone === 'error' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed/50 text-on-tertiary-fixed'
            }`}
          >
            {notice.text}
          </p>
        )}

        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-jakarta text-headline-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="font-jakarta text-headline-lg text-on-surface truncate">{name}</h1>
            <p className="font-inter text-body-md text-on-surface-variant truncate">{email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-primary-fixed text-on-primary-fixed font-inter text-label-sm px-2 py-0.5 rounded-full">
                {isOrganizer ? 'Organizer' : 'Youth member'}
              </span>
              {memberSince && <span className="font-inter text-label-sm text-outline font-medium">Since {memberSince}</span>}
            </div>
          </div>
        </section>

        {isOrganizer ? (
          <Link
            href="/organizer"
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">dashboard</span>
              <span className="font-jakarta text-title-md text-on-surface">Organizer dashboard</span>
            </span>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>
        ) : (
          <form action={becomeOrganizer} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">campaign</span>
              <div>
                <p className="font-jakarta text-title-md text-on-surface">Want to host events?</p>
                <p className="font-inter text-body-md text-on-surface-variant">Switch to an organizer account to create events.</p>
              </div>
            </div>
            <button type="submit" className="h-11 rounded-full bg-surface-container-high text-primary font-inter text-label-md font-bold">
              Become an organizer
            </button>
          </form>
        )}

        <Link
          href="/reset-password"
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">lock_reset</span>
            <span className="font-jakarta text-title-md text-on-surface">Change password</span>
          </span>
          <span className="material-symbols-outlined text-outline">chevron_right</span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full h-12 rounded-full border-2 border-outline-variant text-on-surface font-inter text-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log out
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  )
}
