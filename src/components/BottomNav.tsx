'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Home', icon: 'local_activity', path: '/home' },
  { label: 'Search', icon: 'search', path: '/search' },
  { label: 'My Weekend', icon: 'calendar_month', path: '/my-weekend' },
  { label: 'Profile', icon: 'person', path: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-space-xs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
          return (
            <Link
              key={tab.path}
              href={tab.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors group ${isActive ? 'text-primary-container font-semibold' : 'text-on-surface-variant'}`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
              </div>
              <span className="font-inter text-label-sm tracking-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
