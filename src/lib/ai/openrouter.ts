// OpenRouter connection (server only). OpenRouter speaks the OpenAI chat-completions format,
// so we use the official `openai` library pointed at OpenRouter's address.
import 'server-only'
import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'

/** Secret key – set OPENROUTER_API_KEY in Vercel (never NEXT_PUBLIC_). */
export const isAiConfigured = Boolean(process.env.OPENROUTER_API_KEY)

/**
 * Models are OpenRouter model ids (see openrouter.ai/models), e.g. "anthropic/claude-sonnet-4.5".
 * `main` does the harder reasoning (searching, scheduling); `fast` does the simpler steps.
 */
export const MODELS = {
  main: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5',
  fast: process.env.OPENROUTER_FAST_MODEL || process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
}

let client: OpenAI | null = null

function openrouter(): OpenAI {
  client ??= new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    // Optional attribution headers OpenRouter uses to show your app in its rankings.
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://weekendr.app',
      'X-Title': 'Weekendr',
    },
    timeout: 40_000,
    maxRetries: 1,
  })
  return client
}

/** Running token count for one planner run. */
export class Usage {
  total = 0
  add(u: { total_tokens?: number } | null | undefined) {
    this.total += u?.total_tokens ?? 0
  }
}

/** Friendly errors for the UI; details go to the server log. */
export class AiError extends Error {}

/** The model replied, but twice without a usable answer (callers may fall back to simple rules). */
export class UnusableAnswerError extends AiError {}

function describeApiError(err: unknown): AiError {
  if (err instanceof OpenAI.APIError) {
    console.error('OpenRouter error', err.status, err.message)
    if (err.status === 401) return new AiError('The AI service key is invalid. Check OPENROUTER_API_KEY.')
    if (err.status === 402) return new AiError('The AI service is out of credits. Top up your OpenRouter account.')
    if (err.status === 429) return new AiError('The AI service is busy right now. Please try again in a minute.')
    if (err.status === 404 || err.status === 400) return new AiError('The AI model is unavailable or misconfigured. Check the OPENROUTER_MODEL setting.')
    return new AiError('The AI service had a problem. Please try again.')
  }
  if (err instanceof AiError) return err
  console.error('AI call failed', err)
  return new AiError('Couldn’t reach the AI service. Please try again.')
}

/** Pulls the first JSON object out of a reply (some models wrap JSON in ``` fences or text). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('no JSON object found')
  return JSON.parse(candidate.slice(start, end + 1))
}

/**
 * One agent turn that must answer in a fixed JSON shape.
 * `validate` returns the typed value, or an error message; on an error the model gets one retry.
 */
export async function callJson<T>(opts: {
  model: string
  system: string
  user: string
  schemaName: string
  schema: Record<string, unknown>
  validate: (value: unknown) => T | string
  usage: Usage
  maxTokens?: number
}): Promise<T> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: opts.system },
    { role: 'user', content: opts.user },
  ]
  for (let attempt = 0; attempt < 2; attempt++) {
    let text: string
    try {
      const completion = await openrouter().chat.completions.create({
        model: opts.model,
        messages,
        max_tokens: opts.maxTokens ?? 2000,
        response_format: {
          type: 'json_schema',
          json_schema: { name: opts.schemaName, strict: true, schema: opts.schema },
        },
      })
      opts.usage.add(completion.usage)
      text = completion.choices[0]?.message?.content ?? ''
    } catch (err) {
      throw describeApiError(err)
    }

    let problem: string
    try {
      const result = opts.validate(extractJson(text))
      if (typeof result !== 'string') return result
      problem = result
    } catch (err) {
      problem = `Your reply was not valid JSON (${(err as Error).message}).`
    }
    messages.push({ role: 'assistant', content: text || '(empty)' })
    messages.push({ role: 'user', content: `${problem} Reply again with only the corrected JSON object.` })
  }
  throw new UnusableAnswerError('The AI gave an unusable answer. Please try again.')
}

export type ToolHandler = (args: Record<string, unknown>) => unknown
export type AgentTool = { definition: ChatCompletionTool; run: ToolHandler }

/**
 * An agent that works in a loop: the model calls our tools, we run them and send results back,
 * until it calls the `finishTool` (whose arguments are returned) or runs out of turns.
 */
export async function runToolAgent(opts: {
  model: string
  system: string
  user: string
  tools: AgentTool[]
  finishTool: string
  maxTurns: number
  usage: Usage
  onToolCall?: (name: string, args: Record<string, unknown>) => void
}): Promise<Record<string, unknown> | null> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: opts.system },
    { role: 'user', content: opts.user },
  ]
  const byName = new Map(opts.tools.map((t) => [t.definition.type === 'function' ? t.definition.function.name : '', t]))

  for (let turn = 0; turn < opts.maxTurns; turn++) {
    const lastTurn = turn === opts.maxTurns - 1
    let message
    try {
      const completion = await openrouter().chat.completions.create({
        model: opts.model,
        messages: lastTurn
          ? [...messages, { role: 'user', content: `This is your last step: call ${opts.finishTool} now with your best answer.` }]
          : messages,
        tools: opts.tools.map((t) => t.definition),
        tool_choice: 'auto',
        max_tokens: 2000,
      })
      opts.usage.add(completion.usage)
      message = completion.choices[0]?.message
    } catch (err) {
      throw describeApiError(err)
    }
    if (!message) break

    const calls = (message.tool_calls ?? []).filter((c) => c.type === 'function')
    if (calls.length === 0) {
      // No tool call: remind the agent how to finish.
      messages.push({ role: 'assistant', content: message.content ?? '' })
      messages.push({ role: 'user', content: `Use the tools, then call ${opts.finishTool} to submit.` })
      continue
    }

    messages.push({ role: 'assistant', content: message.content ?? null, tool_calls: message.tool_calls })
    for (const call of calls) {
      let args: Record<string, unknown> = {}
      try {
        const parsed = JSON.parse(call.function.arguments || '{}')
        if (parsed && typeof parsed === 'object') args = parsed as Record<string, unknown>
      } catch {
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ error: 'Arguments were not valid JSON.' }) })
        continue
      }
      if (call.function.name === opts.finishTool) return args
      opts.onToolCall?.(call.function.name, args)
      const tool = byName.get(call.function.name)
      let result: unknown
      try {
        result = tool ? tool.run(args) : { error: `Unknown tool ${call.function.name}` }
      } catch (err) {
        result = { error: (err as Error).message }
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) })
    }
  }
  return null
}
