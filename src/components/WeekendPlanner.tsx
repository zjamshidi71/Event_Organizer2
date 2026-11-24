'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { CATEGORY_META } from '@/lib/categories'
import { formatDayTime, formatTime } from '@/lib/format'
import { formatMiles } from '@/lib/map-links'
import {
  MAX_AGE,
  MAX_REQUEST_CHARS,
  MIN_AGE,
  PLANNER_AGENTS,
  type AgentId,
  type Plan,
  type PlannerMessage,
} from '@/lib/ai/planner-types'
import type { Category } from '@/types/database'

const EXAMPLES = [
  'Free stuff on Saturday afternoon, I love sport 🏀',
  'Music and food with friends, £20 budget for the whole weekend',
  'Something creative on Sunday, I’m new to London',
  'Chill evening plans, nothing too loud',
]

type StepState = { status: 'waiting' | 'running' | 'done' | 'skipped'; detail?: string }
const freshSteps = (): Record<AgentId, StepState> =>
  Object.fromEntries(PLANNER_AGENTS.map((a) => [a.id, { status: 'waiting' }])) as Record<AgentId, StepState>

const LOCATION_KEY = 'weekendr:my-location' // shared with the Home page's "Near me"

export default function WeekendPlanner({ defaultAge }: { defaultAge: number | null }) {
  const [request, setRequest] = useState('')
  const [age, setAge] = useState<number | ''>(defaultAge ?? '')
  const [useLocation, setUseLocation] = useState(false)
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState<Record<AgentId, StepState>>(freshSteps)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const getLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      try {
        const saved = window.sessionStorage.getItem(LOCATION_KEY)
        if (saved) return resolve(JSON.parse(saved))
      } catch {
        /* ignore */
      }
      if (!('geolocation' in navigator)) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, maximumAge: 300000 },
      )
    })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (running || !age || request.trim().length < 3) return
    setRunning(true)
    setError('')
    setPlan(null)
    setSteps(freshSteps())
    try {
      const location = useLocation ? await getLocation() : null
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: request.trim(), age, location }),
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'The planner couldn’t start. Please try again.')
      }
      // Read the newline-delimited progress messages as they arrive.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finished = false
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const msg = JSON.parse(line) as PlannerMessage
          if (msg.type === 'step') {
            setSteps((prev) => ({ ...prev, [msg.agent]: { status: msg.status, detail: msg.detail ?? prev[msg.agent].detail } }))
          } else if (msg.type === 'result') {
            finished = true
            setPlan(msg.plan)
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
          } else if (msg.type === 'error') {
            finished = true
            setError(msg.message)
          }
        }
      }
      if (!finished) setError('The planner stopped unexpectedly. Please try again.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  // Show the team once the request has actually started (not for errors before any agent ran).
  const started = running || Object.values(steps).some((st) => st.status !== 'waiting')

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="bg-surface-container-lowest rounded-2xl p-4 shadow-md flex flex-col gap-3">
        <label htmlFor="planner-request" className="font-jakarta text-title-md text-on-surface">
          What kind of weekend are you after?
        </label>
        <textarea
          id="planner-request"
          rows={3}
          maxLength={MAX_REQUEST_CHARS}
          required
          minLength={3}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="e.g. I’m into music and art, free on Saturday, £15 budget"
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-jakarta text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setRequest(ex)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-inter text-label-md hover:bg-surface-container"
            >
              {ex}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-inter text-label-md text-on-surface">
            Your age
            <select
              required
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">–</option>
              {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 font-inter text-label-md text-on-surface cursor-pointer">
            <input type="checkbox" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} className="w-4 h-4 accent-primary" />
            Use my location for distances
          </label>
        </div>
        <button
          type="submit"
          disabled={running || !age || request.trim().length < 3}
          className="h-12 rounded-full bg-primary text-on-primary font-jakarta text-title-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          {running ? 'Planning…' : 'Plan my weekend'}
        </button>
      </form>

      {started && (
        <section aria-label="Planner progress" aria-live="polite" className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <p className="font-inter text-label-sm text-primary uppercase tracking-wider">Your planning team</p>
          {PLANNER_AGENTS.map((agent) => {
            const step = steps[agent.id]
            return (
              <div key={agent.id} className={`flex items-start gap-3 ${step.status === 'waiting' ? 'opacity-50' : ''}`}>
                <span
                  className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center ${
                    step.status === 'done' ? 'bg-primary text-on-primary' : step.status === 'running' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-outline'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${step.status === 'running' ? 'animate-pulse' : ''}`}>
                    {step.status === 'done' ? 'check' : step.status === 'skipped' ? 'remove' : agent.icon}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="font-jakarta text-body-md text-on-surface font-semibold">{agent.name}</p>
                  <p className="font-inter text-label-md text-on-surface-variant truncate">
                    {step.status === 'skipped' ? 'Not needed' : step.detail || agent.job}
                  </p>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {error && (
        <p role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container font-inter text-body-md flex gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </p>
      )}

      {plan && (
        <section ref={resultRef} aria-label="Your weekend plan" className="flex flex-col gap-3 scroll-mt-20">
          <div>
            <h2 className="font-jakarta text-headline-lg text-on-surface">{plan.headline}</h2>
            <p className="font-jakarta text-body-lg text-on-surface-variant mt-1">{plan.summary}</p>
          </div>

          {plan.items.map((item, i) => {
            const cat = CATEGORY_META[item.categories[0] as Category]
            return (
              <Link
                key={item.eventId}
                href={`/events/${item.eventId}`}
                className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex gap-3 hover:shadow-lg transition-shadow"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center text-3xl">
                  {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized /> : cat?.emoji ?? '✨'}
                  <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-inverse-surface/90 text-inverse-on-surface font-inter text-label-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <p className="font-inter text-label-sm text-primary uppercase tracking-wide">
                    {formatDayTime(item.startsAt)}
                    {item.endsAt && ` – ${formatTime(item.endsAt)}`}
                  </p>
                  <h3 className="font-jakarta text-title-md text-on-surface">{item.title}</h3>
                  <p className="font-inter text-label-md text-outline">
                    {item.pricePence === 0 ? 'Free' : `£${(item.pricePence / 100).toFixed(2)}`}
                    {item.area && ` · ${item.area}`}
                    {item.distanceMiles != null && ` · ${formatMiles(item.distanceMiles)}`}
                  </p>
                  {item.blurb && <p className="font-jakarta text-body-md text-on-surface-variant">{item.blurb}</p>}
                </div>
              </Link>
            )
          })}

          {plan.items.length > 0 && (
            <div className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between">
              <span className="font-inter text-label-md text-on-surface-variant">Total for the weekend</span>
              <span className="font-jakarta text-title-md text-on-surface">
                {plan.totalPence === 0 ? 'Free' : `£${(plan.totalPence / 100).toFixed(2)}`}
              </span>
            </div>
          )}

          {plan.tips.length > 0 && (
            <ul className="p-3 rounded-xl bg-tertiary-fixed/40 flex flex-col gap-1.5">
              {plan.tips.map((tip) => (
                <li key={tip} className="font-inter text-label-md text-on-tertiary-fixed flex gap-2">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}

          <p className="font-inter text-label-sm text-outline font-medium">
            Suggestions are made by AI from this weekend’s listings. Always check the event page for details before you go.
          </p>
        </section>
      )}
    </div>
  )
}
