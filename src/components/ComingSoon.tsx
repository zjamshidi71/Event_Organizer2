import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface ComingSoonProps {
  title: string
  icon: string
  description: string
}

export default function ComingSoon({ title, icon, description }: ComingSoonProps) {
  return (
    <>
      <TopBar />
      <main className="flex-1 pt-24 pb-28 px-margin max-w-lg mx-auto w-full flex flex-col items-center justify-center text-center gap-space-md">
        <span className="material-symbols-outlined text-primary text-[48px]">{icon}</span>
        <h1 className="font-jakarta text-headline-lg text-on-surface">{title}</h1>
        <p className="font-inter text-body-md text-on-surface-variant">{description}</p>
        <Link
          href="/home"
          className="mt-space-sm h-11 px-space-lg rounded-full bg-primary text-on-primary font-inter text-label-md flex items-center"
        >
          Back to Home
        </Link>
      </main>
      <BottomNav />
    </>
  )
}
