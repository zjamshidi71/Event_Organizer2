import AuthShell from '@/components/auth/AuthShell'
import { ResetPasswordForm } from '@/components/auth/PasswordForms'

export const metadata = { title: 'Choose a new password – Weekendr' }

// Reached from the reset email link (the link logs the user in first).
export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password">
      <ResetPasswordForm />
    </AuthShell>
  )
}
