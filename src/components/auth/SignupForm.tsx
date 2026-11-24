'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormState } from 'react-dom'
import { signup, type AuthState } from '@/app/auth/actions'
import { Field, FormAlert, SubmitButton } from './FormBits'
import ResendConfirmation from './ResendConfirmation'
import SocialButtons from './SocialButtons'

const ROLES = [
  { value: 'youth', icon: 'celebration', title: 'Going to events', text: 'Find things to do this weekend' },
  { value: 'organizer', icon: 'campaign', title: 'Hosting events', text: 'Create and manage your events' },
] as const

export default function SignupForm({ next, providers }: { next?: string; providers: ('google' | 'github')[] }) {
  const [state, action] = useFormState<AuthState, FormData>(signup, undefined)
  const [role, setRole] = useState<'youth' | 'organizer'>('youth')

  if (state?.message) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span className="material-symbols-outlined text-primary text-[48px] self-center">mark_email_unread</span>
        <FormAlert message={state.message} />
        <p className="font-inter text-label-md text-outline">Can’t find it? Check your spam folder.</p>
        {state.email && <ResendConfirmation email={state.email} />}
        <Link href="/login" className="font-inter text-label-md text-primary font-bold">
          Go to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="font-inter text-label-md text-on-surface mb-1.5">I’m mainly…</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={role === r.value}
              onClick={() => setRole(r.value)}
              className={`p-3 rounded-xl text-left flex flex-col gap-1 transition-all ${
                role === r.value
                  ? 'bg-primary-fixed ring-2 ring-primary text-on-primary-fixed'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-primary">{r.icon}</span>
              <span className="font-jakarta text-title-md">{r.title}</span>
              <span className="font-inter text-label-sm font-medium">{r.text}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <SocialButtons providers={providers} next={next} role={role} />

      <form action={action} className="flex flex-col gap-4">
        <FormAlert error={state?.error} />
        <input type="hidden" name="next" value={next ?? ''} />
        <input type="hidden" name="role" value={role} />

        <Field label="Your name" name="full_name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state?.email} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters" />

        <label className="flex items-start gap-2.5 font-inter text-body-md text-on-surface-variant">
          <input type="checkbox" name="terms" required className="mt-1 w-4 h-4 accent-primary" />
          <span>I agree to the community guidelines: no harassment, hate speech or unsafe behaviour.</span>
        </label>

        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      </form>
    </div>
  )
}
