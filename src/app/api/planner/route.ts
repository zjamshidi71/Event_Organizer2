// POST /api/planner – runs the AI Weekend Planner and streams progress as newline-delimited JSON.
import { NextResponse, type NextRequest } from 'next/server'
import { AiError, isAiConfigured } from '@/lib/ai/openrouter'
import { runWeekendPlanner } from '@/lib/ai/planner'
import { MAX_AGE, MAX_REQUEST_CHARS, MIN_AGE, type PlannerMessage } from '@/lib/ai/planner-types'
import { getWeekendEvents } from '@/lib/events'
import { isPlausibleUkLocation } from '@/lib/map-links'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
// The five agents usually take 15–40 seconds; allow up to 60 (Vercel's limit on most plans).
export const maxDuration = 60

const HOURLY_LIMIT = Number(process.env.PLANNER_HOURLY_LIMIT) || 5

const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status })

export async function POST(request: NextRequest) {
  if (!isAiConfigured || !isSupabaseConfigured) return fail('The AI planner isn’t set up yet.', 503)

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('Please log in to use the planner.', 401)

  // ── Validate input ───────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return fail('Invalid request.', 400)
  }
  const text = typeof body.request === 'string' ? body.request.trim() : ''
  if (text.length < 3 || text.length > MAX_REQUEST_CHARS) return fail(`Describe your ideal weekend in 3–${MAX_REQUEST_CHARS} characters.`, 400)
  const age = Number(body.age)
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) return fail(`Choose an age between ${MIN_AGE} and ${MAX_AGE}.`, 400)
  const loc = body.location as { lat?: unknown; lng?: unknown } | null | undefined
  const location =
    loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && isPlausibleUkLocation(loc.lat, loc.lng)
      ? { lat: loc.lat, lng: loc.lng }
      : null

  // ── Rate limit (each run costs AI credits) ───────────────
  const since = new Date(Date.now() - 3600 * 1000).toISOString()
  const { count, error: countError } = await supabase
    .from('planner_runs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (countError) {
    console.error('planner_runs count failed (did you run migration 0004?):', countError.message)
    return fail('The planner isn’t available right now.', 503)
  }
  if ((count ?? 0) >= HOURLY_LIMIT) return fail(`You’ve used the planner ${HOURLY_LIMIT} times this hour. Try again later.`, 429)

  const { data: run, error: runError } = await supabase.from('planner_runs').insert({}).select('id').single()
  if (runError || !run) {
    console.error('planner_runs insert failed:', runError?.message)
    return fail('The planner isn’t available right now.', 503)
  }

  // Remember their age on the profile if it isn't set yet (saves asking next time).
  await supabase
    .from('profiles')
    .update({ birth_year: new Date().getFullYear() - age })
    .eq('id', user.id)
    .is('birth_year', null)

  const { weekend, result } = await getWeekendEvents()
  if (!result.ok) return fail(result.error, 503)

  // ── Stream the agents' progress ──────────────────────────
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (msg: PlannerMessage) => controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'))
      let status: 'succeeded' | 'failed' = 'failed'
      let tokens: number | null = null
      try {
        const out = await runWeekendPlanner(
          { request: text, age, location, events: result.data, days: weekend.days },
          (agent, stepStatus, detail) => send({ type: 'step', agent, status: stepStatus, detail }),
        )
        send({ type: 'result', plan: out.plan })
        status = 'succeeded'
        tokens = out.tokens
      } catch (err) {
        console.error('Weekend planner failed:', err)
        send({ type: 'error', message: err instanceof AiError ? err.message : 'Something went wrong. Please try again.' })
      } finally {
        await supabase.from('planner_runs').update({ status, tokens }).eq('id', run.id)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
  })
}
