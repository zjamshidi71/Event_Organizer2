// Handles the links in Supabase emails (confirm sign-up, reset password).
// Supports both link styles Supabase can send:
//   ?token_hash=...&type=...   (recommended email template – works on any device)
//   ?code=...                  (default template – must be opened in the same browser)
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { safeNext } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  const supabase = createClient()
  let ok = false

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    ok = !error
    if (error) console.error('verifyOtp failed:', error.message)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
    if (error) console.error('exchangeCodeForSession failed:', error.message)
  }

  const url = request.nextUrl.clone()
  url.search = ''
  if (ok) {
    url.pathname = next
    if (next === '/home') url.searchParams.set('welcome', '1')
  } else {
    url.pathname = '/login'
    url.searchParams.set('notice', 'link-invalid')
  }
  return NextResponse.redirect(url)
}
