'use client'

import { useFormState } from 'react-dom'
import { requestPasswordReset, updatePassword, type AuthState } from '@/app/auth/actions'
import { Field, FormAlert, SubmitButton } from './FormBits'

export function ForgotPasswordForm() {
  const [state, action] = useFormState<AuthState, FormData>(requestPasswordReset, undefined)
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormAlert {...state} />
      {!state?.message && (
        <>
          <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state?.email} />
          <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        </>
      )}
    </form>
  )
}

export function ResetPasswordForm() {
  const [state, action] = useFormState<AuthState, FormData>(updatePassword, undefined)
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormAlert {...state} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters" />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" minLength={8} />
      <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
    </form>
  )
}
