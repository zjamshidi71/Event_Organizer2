'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string; email?: string } | undefined

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8
const NOT_CONFIGURED: AuthState = { error: 'Log-in is unavailable: the app is not connected to Supabase yet.' }

/** The site's own address, used in links inside emails. */
function siteOrigin(): string {
  const h = headers()
  const origin = h.get('origin')
  if (origin) return origin
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const host = h.get('x-forwarded-host') ?? h.get('host')
  return host ? `${h.get('x-forwarded-proto') ?? 'https'}://${host}` : 'http://localhost:3000'
}

/** Turns Supabase's error messages into friendlier ones. */
function friendly(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Wrong email or password.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first – check your inbox for the link we sent.'
  if (m.includes('already registered')) return 'An account with this email already exists. Try logging in instead.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.'
  if (m.includes('password')) return message
  return 'Something went wrong. Please try again.'
}

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim()

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED
  const email = field(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  if (!EMAIL_RE.test(email) || !password) return { error: 'Enter your email and password.', email }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: friendly(error.message), email }

  revalidatePath('/', 'layout')
  redirect(safeNext(form.get('next')))
}

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED
  const fullName = field(form, 'full_name')
  const email = field(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  const role = form.get('role') === 'organizer' ? 'organizer' : 'youth'

  if (fullName.length < 2) return { error: 'Please enter your name.', email }
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.', email }
  if (password.length < MIN_PASSWORD) return { error: `Password must be at least ${MIN_PASSWORD} characters.`, email }
  if (form.get('terms') !== 'on') return { error: 'Please accept the community guidelines to continue.', email }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${siteOrigin()}/auth/confirm?next=${encodeURIComponent(safeNext(form.get('next')))}`,
    },
  })
  if (error) return { error: friendly(error.message), email }

  // If email confirmation is switched off in Supabase, the user is logged in straight away.
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect(safeNext(form.get('next')))
  }

  return {
    message: `We sent a confirmation link to ${email}. Open it to activate your account, then log in.`,
    email,
  }
}

export async function logout() {
  if (isSupabaseConfigured) {
    const supabase = createClient()
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/login?notice=logged-out')
}

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED
  const email = field(form, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.', email }

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/confirm?next=/reset-password`,
  })
  if (error && friendly(error.message).startsWith('Too many')) return { error: friendly(error.message), email }

  // Same message whether or not the account exists, so emails can't be probed.
  return { message: `If an account exists for ${email}, we've sent a link to reset your password.`, email }
}

export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED
  const password = String(form.get('password') ?? '')
  const confirm = String(form.get('confirm') ?? '')
  if (password.length < MIN_PASSWORD) return { error: `Password must be at least ${MIN_PASSWORD} characters.` }
  if (password !== confirm) return { error: 'The two passwords don’t match.' }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: friendly(error.message) }

  revalidatePath('/', 'layout')
  redirect('/profile?notice=password-updated')
}

/** Lets a youth account start hosting events. */
export async function becomeOrganizer() {
  if (!isSupabaseConfigured) return
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')
  const { error } = await supabase.from('profiles').update({ role: 'organizer' }).eq('id', user.id)
  if (error) {
    console.error('becomeOrganizer failed:', error.message)
    redirect('/profile?notice=update-failed')
  }
  revalidatePath('/', 'layout')
  redirect('/organizer')
}
