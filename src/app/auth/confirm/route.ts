// Handles every link that brings someone back to the app after authenticating:
//   ?token_hash=...&type=...   email links (recommended template – works on any device)
//   ?code=...                  Google/GitHub log-in, and the default email template
//   ?error=...                 the person cancelled, or the provider refused
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { SIGNUP_ROLE_COOKIE, safeNext } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// An account counts as "just created" for this long (used to apply the sign-up role choice).
const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  const supabase = createClient()
  let ok = false

  if (searchParams.get('error')) {
    console.error('Auth provider returned an error:', searchParams.get('error'), searchParams.get('error_description'))
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    ok = !error
    if (error) console.error('verifyOtp failed:', error.message)
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
    if (error) console.error('exchangeCodeForSession failed:', error.message)

    // Someone who picked "Hosting events" before continuing with Google/GitHub becomes an organizer,
    // but only if their account was created just now (so existing accounts are never changed).
    const wantsOrganizer = request.cookies.get(SIGNUP_ROLE_COOKIE)?.value === 'organizer'
    const user = data?.user
    if (ok && wantsOrganizer && user && Date.now() - new Date(user.created_at).getTime() < NEW_ACCOUNT_WINDOW_MS) {
      const { error: roleError } = await supabase.from('profiles').update({ role: 'organizer' }).eq('id', user.id)
      if (roleError) console.error('Could not set organizer role:', roleError.message)
    }
  }

  const url = request.nextUrl.clone()
  url.search = ''
  if (ok) {
    url.pathname = next
    if (next === '/home') url.searchParams.set('welcome', '1')
  } else {
    url.pathname = '/login'
    url.searchParams.set('notice', searchParams.get('error') ? 'oauth-failed' : 'link-invalid')
  }
  const response = NextResponse.redirect(url)
  response.cookies.delete(SIGNUP_ROLE_COOKIE)
  return response
}
