'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AccountButton from '@/components/AccountButton'

interface TopBarProps {
  variant?: 'home' | 'back'
  title?: string
  city?: string
  /** Show the Share button (e.g. on event pages). */
  shareable?: boolean
}

function ShareButton({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    // Share the clean page address (without one-off notices like ?created=1).
    const url = window.location.origin + window.location.pathname
    // Phones: open the native share sheet. Elsewhere: copy the link.
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? 'Weekendr', url })
        return
      } catch (err) {
        if ((err as Error).name === 'AbortError') return // user closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <span className="relative">
      <button
        type="button"
        aria-label="Share"
        onClick={share}
        className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">ios_share</span>
      </button>
      {copied && (
        <span role="status" className="absolute top-12 right-0 whitespace-nowrap bg-inverse-surface text-inverse-on-surface font-inter text-label-sm px-3 py-1.5 rounded-full shadow-lg">
          Link copied
        </span>
      )}
    </span>
  )
}

export default function TopBar({ variant = 'home', title, city = 'London', shareable = false }: TopBarProps) {
  const router = useRouter()

  const goBack = () => {
    // If the page was opened directly (no history in this tab), go to Home instead.
    if (window.history.length > 1) router.back()
    else router.push('/home')
  }

  if (variant === 'back') {
    return (
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={goBack}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
            <h1 className="font-jakarta text-headline-sm text-on-surface tracking-tight truncate max-w-[200px]">{title}</h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <Link
              href="/organizer"
              aria-label="Host Mode"
              className="h-9 px-space-sm bg-surface-container-highest rounded-full flex items-center gap-1 text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span className="font-inter text-label-sm hidden sm:inline">Host Mode</span>
            </Link>
            {shareable && <ShareButton title={title} />}
            <AccountButton />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
        <Link href="/home" className="font-jakarta text-headline-sm text-primary tracking-tight font-bold flex-shrink-0">
          Weekendr
        </Link>
        {/* Only London for now – becomes a city picker once events exist in more cities. */}
        <span className="flex-1 max-w-[150px] sm:max-w-[180px] h-10 px-space-sm bg-surface-container-low rounded-full flex items-center justify-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
          <span className="font-inter text-label-md truncate text-on-surface">{city}</span>
        </span>
        <div className="flex items-center gap-space-xs flex-shrink-0">
          <AccountButton />
        </div>
      </div>
    </header>
  )
}
