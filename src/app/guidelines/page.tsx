import TopBar from '@/components/TopBar'

export const metadata = { title: 'Community Safety Guidelines – Weekendr' }

const SECTIONS = [
  {
    icon: 'favorite',
    title: 'Respect everyone',
    points: [
      'Zero tolerance for harassment, bullying, hate speech or discrimination – online or at events.',
      'Respect people’s boundaries, pronouns and privacy. Ask before taking or sharing photos of others.',
    ],
  },
  {
    icon: 'shield_person',
    title: 'Hosting safely',
    points: [
      'A named host (you or a trusted team member) must be on-site for the whole event and manage check-in.',
      'Never go over the capacity you set. Keep exits clear and know where the nearest first-aid point is.',
      'Events for under-18s must not serve or allow alcohol, and must have an adult host present.',
      'Pick public or properly licensed venues. Private-home events aren’t allowed.',
    ],
  },
  {
    icon: 'badge',
    title: 'Honest listings',
    points: [
      'Describe your event accurately: real venue, real times, real price, and any age or ID requirements.',
      'If plans change or you need to cancel, update the event as early as possible so attendees know.',
    ],
  },
  {
    icon: 'health_and_safety',
    title: 'For attendees',
    points: [
      'Tell someone you trust where you’re going and how you’ll get home.',
      'If something feels wrong, leave and speak to the host or venue staff. In an emergency call 999.',
    ],
  },
]

export default function GuidelinesPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  return (
    <>
      <TopBar variant="back" title="Safety Guidelines" />
      <main className="pt-20 pb-12 px-margin max-w-lg mx-auto flex flex-col gap-4">
        <div>
          <h1 className="font-jakarta text-headline-lg text-on-surface">Community Safety Guidelines</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-1">
            Weekendr is for young people aged 16–24. Everyone who hosts or attends an event agrees to these guidelines.
          </p>
        </div>
        {SECTIONS.map((section) => (
          <section key={section.title} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
            <h2 className="font-jakarta text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">{section.icon}</span>
              {section.title}
            </h2>
            <ul className="mt-2 flex flex-col gap-2 list-disc pl-5 font-inter text-body-md text-on-surface-variant">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
        <section id="report" className="bg-surface-container-high rounded-2xl p-4">
          <h2 className="font-jakarta text-title-md text-on-surface">Report a problem</h2>
          <p className="font-inter text-body-md text-on-surface-variant mt-1">
            {supportEmail ? (
              <>
                Email{' '}
                <a className="text-primary font-semibold underline" href={`mailto:${supportEmail}?subject=${encodeURIComponent('Weekendr safety report')}`}>
                  {supportEmail}
                </a>{' '}
                with the event name and what happened. Events that break these rules are removed.
              </>
            ) : (
              <>Speak to the event host or venue staff. Events that break these rules are removed.</>
            )}
          </p>
        </section>
      </main>
    </>
  )
}
