'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/client'

type Account = { initials: string } | null

function initialsFrom(name: string | undefined, email: string | undefined) {
  const source = name?.trim() || email?.split('@')[0] || '?'
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Top-bar button: "Log in" when logged out, the user's initials when logged in. */
export default function AccountButton() {
  const [account, setAccount] = useState<Account | undefined>(undefined) // undefined = still checking

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAccount(null)
      return
    }
    const supabase = createClient()
    const apply = (user: { email?: string; user_metadata?: { full_name?: string; name?: string; user_name?: string } } | null) => {
      const m = user?.user_metadata
      setAccount(user ? { initials: initialsFrom(m?.full_name || m?.name || m?.user_name, user.email) } : null)
    }

    supabase.auth.getUser().then(({ data }) => apply(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (account === undefined) {
    return <span className="w-11 h-11 flex items-center justify-center"><span className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" /></span>
  }

  if (!account) {
    return (
      <Link
        href="/login"
        className="h-9 px-3.5 rounded-full bg-primary text-on-primary font-inter text-label-md flex items-center hover:bg-primary-container transition-colors"
      >
        Log in
      </Link>
    )
  }

  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      className="w-11 h-11 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
    >
      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-inter text-label-sm flex items-center justify-center">
        {account.initials}
      </span>
    </Link>
  )
}
