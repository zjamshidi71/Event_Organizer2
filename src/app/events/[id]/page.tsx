import Image from 'next/image'
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { CATEGORY_META } from '@/lib/categories'
import { getEventById } from '@/lib/events'
import { ageLabel, formatLongDate, formatPrice, formatTime, percentFull, spotsLeft } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const result = await getEventById(params.id)

  if (!result.ok) {
    return (
      <>
        <TopBar variant="back" title="Event" />
        <main className="pt-24 px-margin max-w-lg mx-auto">
          <div role="alert" className="p-4 rounded-2xl bg-error-container text-on-error-container">
            <p className="font-jakarta text-title-md">This event couldn&apos;t be loaded</p>
            <p className="font-inter text-body-md mt-1">{result.error}</p>
          </div>
        </main>
      </>
    )
  }

  const event = result.data
  if (!event) notFound()

  const price = formatPrice(event)
  const isFree = price === 'Free'
  const left = spotsLeft(event)
  const soldOut = left === 0
  const age = ageLabel(event.age_group)

  return (
    <>
      <TopBar variant="back" title={event.title} />
      <main className="pt-16 pb-32 max-w-lg mx-auto">
        <div className="relative w-full h-64 bg-surface-container-high">
          {event.image_url ? (
            <Image src={event.image_url} alt={event.title} fill className="object-cover" unoptimized priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center text-7xl">
              {CATEGORY_META[event.categories[0]]?.emoji ?? '✨'}
            </div>
          )}
        </div>

        <div className="px-margin -mt-6 relative">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {event.categories.map((c) => (
                <span key={c} className="bg-surface-container-high text-on-surface font-inter text-label-sm px-2.5 py-1 rounded-full">
                  {CATEGORY_META[c]?.emoji} {CATEGORY_META[c]?.label ?? c}
                </span>
              ))}
              {age && (
                <span className="bg-surface-container-high text-on-surface font-inter text-label-sm px-2.5 py-1 rounded-full">{age}</span>
              )}
              {event.status !== 'published' && (
                <span className="bg-error-container text-on-error-container font-inter text-label-sm px-2.5 py-1 rounded-full uppercase">
                  {event.status}
                </span>
              )}
            </div>

            <h1 className="font-jakarta text-headline-lg text-on-surface">{event.title}</h1>

            <div className="flex items-center gap-1.5">
              <span className="font-inter text-label-md text-on-surface-variant">Hosted by {event.host_name}</span>
              {event.host_verified && <span className="material-symbols-outlined text-primary text-[16px]">verified</span>}
            </div>

            <ul className="flex flex-col gap-2.5 mt-1">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <div>
                  <p className="font-jakarta text-title-md text-on-surface">{formatLongDate(event.starts_at)}</p>
                  <p className="font-inter text-label-md text-outline">
                    {formatTime(event.starts_at)}
                    {event.ends_at && ` – ${formatTime(event.ends_at)}`}
                  </p>
                </div>
              </li>
              {(event.venue || event.area) && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div>
                    <p className="font-jakarta text-title-md text-on-surface">{event.venue ?? event.area}</p>
                    {event.venue && event.area && <p className="font-inter text-label-md text-outline">{event.area}</p>}
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">group</span>
                <div className="flex-1">
                  <p className="font-jakarta text-title-md text-on-surface">
                    {event.rsvp_count} going · {soldOut ? 'Sold out' : `${left} spots left`}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${percentFull(event)}%` }} />
                  </div>
                </div>
              </li>
              {event.perk && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">redeem</span>
                  <p className="font-jakarta text-title-md text-on-surface">{event.perk}</p>
                </li>
              )}
            </ul>

            {event.description && (
              <p className="font-jakarta text-body-lg text-on-surface-variant whitespace-pre-line mt-1">{event.description}</p>
            )}

            {(event.safe_space_accepted || event.verified_host_onsite) && (
              <div className="mt-1 p-3 rounded-xl bg-tertiary-fixed/40 flex flex-col gap-1.5">
                {event.verified_host_onsite && (
                  <p className="font-inter text-label-md text-on-tertiary-fixed flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">shield_person</span> Host on-site for check-in
                  </p>
                )}
                {event.safe_space_accepted && (
                  <p className="font-inter text-label-md text-on-tertiary-fixed flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">health_and_safety</span> Safe space guidelines apply
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom action bar – RSVP/booking arrives with accounts (Steps 4–5) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto px-margin py-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-jakarta text-headline-sm text-on-surface">{isFree ? 'Free' : price}</p>
            <p className="font-inter text-label-sm text-outline">{isFree ? 'RSVP required' : 'per ticket'}</p>
          </div>
          <button
            type="button"
            disabled
            className="px-6 py-3 rounded-full bg-primary text-on-primary font-inter text-label-md font-bold disabled:opacity-50"
            title="RSVPs open once accounts are added"
          >
            {soldOut ? 'Sold out' : isFree ? 'RSVP – coming soon' : 'Booking – coming soon'}
          </button>
        </div>
      </div>
    </>
  )
}
