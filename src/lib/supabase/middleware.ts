// Runs on every page request: refreshes the user's login session cookie and
// sends logged-out visitors away from pages that need an account.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from './config'

// Pages that need a logged-in user. (Organizer-only checks happen in those pages' layouts.)
const PROTECTED_PREFIXES = ['/profile', '/my-weekend', '/create-event', '/organizer', '/reset-password']
// Pages a logged-in user doesn't need to see.
const AUTH_PAGES = ['/login', '/signup']

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + '/'))

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!isSupabaseConfigured) return response

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Important: getUser() validates the session with Supabase and refreshes it if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const redirectTo = (pathname: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    url.search = ''
    Object.entries(params ?? {}).forEach(([k, v]) => url.searchParams.set(k, v))
    const redirect = NextResponse.redirect(url)
    // Keep any refreshed session cookies.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  if (!user && matches(path, PROTECTED_PREFIXES)) {
    return redirectTo('/login', { next: path + request.nextUrl.search })
  }
  if (user && matches(path, AUTH_PAGES)) {
    return redirectTo('/home')
  }

  return response
}
