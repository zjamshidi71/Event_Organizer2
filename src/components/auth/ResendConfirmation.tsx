'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { resendConfirmation, type AuthState } from '@/app/auth/actions'
import { FormAlert } from './FormBits'

function ResendButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-full bg-surface-container-high text-primary font-inter text-label-md font-bold disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Resend confirmation email'}
    </button>
  )
}

/** "Didn't get the email?" helper. Must be rendered outside other <form>s. */
export default function ResendConfirmation({ email }: { email: string }) {
  const [state, action] = useFormState<AuthState, FormData>(resendConfirmation, undefined)
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="email" value={email} />
      {state ? <FormAlert error={state.error} message={state.message} /> : null}
      <ResendButton />
    </form>
  )
}
