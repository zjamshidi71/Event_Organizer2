'use client'

import Link from 'next/link'
import { useFormState } from 'react-dom'
import { login, type AuthState } from '@/app/auth/actions'
import { Field, FormAlert, Notice, SubmitButton } from './FormBits'
import ResendConfirmation from './ResendConfirmation'

export default function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useFormState<AuthState, FormData>(login, undefined)
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        {state ? <FormAlert {...state} /> : <Notice code={notice} />}
        <input type="hidden" name="next" value={next ?? ''} />
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state?.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <Link href="/forgot-password" className="self-end -mt-2 font-inter text-label-md text-primary">
          Forgot password?
        </Link>
        <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      </form>

      {/* Shown when the account exists but the email hasn't been confirmed yet. */}
      {state?.unconfirmed && state.email && (
        <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant">
          <p className="font-inter text-body-md text-on-surface-variant">
            Didn’t get the email? It may be in your spam folder, or we can send a new one.
          </p>
          <ResendConfirmation email={state.email} />
        </div>
      )}
    </div>
  )
}
