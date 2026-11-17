'use client'
import AccountButton from '@/components/AccountButton'
import { useState } from 'react'

interface TopBarProps {
  variant?: 'home' | 'back'
  title?: string
  city?: string
}

export default function TopBar({ variant = 'home', title, city = 'London' }: TopBarProps) {
  const [hasNotification] = useState(true)

  if (variant === 'back') {
    return (
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Go Back" onClick={() => window.history.back()} className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
            <h1 className="font-jakarta text-headline-sm text-on-surface tracking-tight truncate max-w-[200px]">{title}</h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <button aria-label="Host Mode" className="h-9 px-space-sm bg-surface-container-highest rounded-full flex items-center gap-1 text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span className="font-inter text-label-sm hidden sm:inline">Host Mode</span>
            </button>
            <button aria-label="Share" className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
            <AccountButton />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0 flex-shrink-0">
          <span className="font-jakarta text-headline-sm text-primary tracking-tight font-bold">Weekendr</span>
        </div>
        <button aria-label="City Selector" className="flex-1 max-w-[150px] sm:max-w-[180px] h-10 px-space-sm bg-surface-container-low rounded-full flex items-center justify-center gap-space-xs text-on-surface-variant hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
          <span className="font-inter text-label-md truncate text-on-surface">{city}</span>
          <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
        </button>
        <div className="flex items-center gap-space-xs flex-shrink-0">
          <button aria-label="Notifications" className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {hasNotification && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface" />}
          </button>
          <AccountButton />
        </div>
      </div>
    </header>
  )
}
