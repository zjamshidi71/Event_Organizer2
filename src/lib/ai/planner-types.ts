// Shapes shared by the planner API route and the planner page.

export const PLANNER_AGENTS = [
  { id: 'analyst', name: 'Interest Analyst', icon: 'psychology', job: 'Understanding what you’re after' },
  { id: 'scout', name: 'Event Scout', icon: 'travel_explore', job: 'Searching this weekend’s events' },
  { id: 'safety', name: 'Safety Checker', icon: 'health_and_safety', job: 'Checking picks suit your age' },
  { id: 'logistics', name: 'Budget & Logistics', icon: 'route', job: 'Fitting it into your time and budget' },
  { id: 'writer', name: 'Itinerary Writer', icon: 'edit_note', job: 'Writing your plan' },
] as const

export type AgentId = (typeof PLANNER_AGENTS)[number]['id']

export interface PlanItem {
  eventId: string
  title: string
  startsAt: string
  endsAt: string | null
  pricePence: number
  area: string | null
  imageUrl: string | null
  categories: string[]
  distanceMiles: number | null
  blurb: string
}

export interface Plan {
  headline: string
  summary: string
  items: PlanItem[]
  totalPence: number
  tips: string[]
}

/** One line of the streamed response (newline-delimited JSON). */
export type PlannerMessage =
  | { type: 'step'; agent: AgentId; status: 'running' | 'done' | 'skipped'; detail?: string }
  | { type: 'result'; plan: Plan }
  | { type: 'error'; message: string }

export interface PlannerRequest {
  request: string
  age: number
  location?: { lat: number; lng: number } | null
}

export const MAX_REQUEST_CHARS = 500
export const MIN_AGE = 16
export const MAX_AGE = 24
