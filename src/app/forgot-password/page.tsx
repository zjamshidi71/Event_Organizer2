import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/PasswordForms'

export const metadata = { title: 'Reset password – Weekendr' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a link to choose a new one."
      footer={
        <Link href="/login" className="text-primary font-bold">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
