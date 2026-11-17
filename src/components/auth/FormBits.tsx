'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full h-12 rounded-full bg-primary text-on-primary font-inter text-label-md font-bold hover:bg-primary-container transition-colors active:scale-[0.99] disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  )
}

export function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  defaultValue,
  required = true,
  minLength,
  hint,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  defaultValue?: string
  required?: boolean
  minLength?: number
  hint?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-inter text-label-md text-on-surface">{label}</span>
      <span className="relative">
        <input
          name={name}
          type={isPassword && show ? 'text' : type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          required={required}
          minLength={minLength}
          className="w-full px-4 py-3 rounded-DEFAULT bg-surface-container-low text-on-surface placeholder:text-outline font-jakarta text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </span>
      {hint && <span className="font-inter text-label-sm text-outline font-medium">{hint}</span>}
    </label>
  )
}

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error)
    return (
      <p role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container font-inter text-body-md flex gap-2">
        <span className="material-symbols-outlined text-[20px]">error</span>
        {error}
      </p>
    )
  if (message)
    return (
      <p role="status" className="p-3 rounded-xl bg-tertiary-fixed/50 text-on-tertiary-fixed font-inter text-body-md flex gap-2">
        <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
        {message}
      </p>
    )
  return null
}

const NOTICES: Record<string, { error?: string; message?: string }> = {
  'logged-out': { message: 'You’ve been logged out.' },
  'link-invalid': { error: 'That link is invalid or has expired. Please request a new one.' },
  'password-updated': { message: 'Your password has been updated.' },
}

export function Notice({ code }: { code?: string }) {
  const n = code ? NOTICES[code] : undefined
  return n ? <FormAlert {...n} /> : null
}
