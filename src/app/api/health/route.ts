// Visit /api/health to check that the app can reach your Supabase database.
import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        step: 'environment variables',
        message:
          'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set. ' +
          'Add them in Vercel → Settings → Environment Variables, then redeploy.',
      },
      { status: 500 },
    )
  }

  const supabase = createClient()
  const { count, error } = await supabase.from('events').select('id', { count: 'exact', head: true })

  if (error && /fetch failed|ENOTFOUND|ECONNREFUSED/i.test(error.message)) {
    return NextResponse.json(
      {
        ok: false,
        step: 'connection',
        message: 'Could not reach Supabase. Check that NEXT_PUBLIC_SUPABASE_URL is correct, e.g. https://abcd1234.supabase.co',
        details: error.message,
      },
      { status: 500 },
    )
  }

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        step: 'database',
        message:
          'Connected to Supabase, but could not read the events table. Did you run supabase/migrations/0001_init.sql in the SQL Editor?',
        details: error.message,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, message: 'Connected to Supabase', publishedEvents: count })
}
