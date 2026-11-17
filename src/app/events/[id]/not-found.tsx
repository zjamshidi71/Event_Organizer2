import Link from 'next/link'

export default function EventNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 px-margin text-center">
      <span className="material-symbols-outlined text-outline text-[48px]">event_busy</span>
      <h1 className="font-jakarta text-headline-lg text-on-surface">Event not found</h1>
      <p className="font-inter text-body-md text-on-surface-variant">It may have been removed or the link is wrong.</p>
      <Link href="/home" className="mt-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-inter text-label-md">
        Back to Home
      </Link>
    </main>
  )
}
