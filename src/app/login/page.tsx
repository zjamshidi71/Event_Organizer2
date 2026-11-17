import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'
import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Log in – Weekendr' }

export default function LoginPage({ searchParams }: { searchParams: { next?: string; notice?: string } }) {
  const signupHref = searchParams.next ? `/signup?next=${encodeURIComponent(searchParams.next)}` : '/signup'
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to RSVP, save events and host your own."
      footer={
        <>
          New to Weekendr?{' '}
          <Link href={signupHref} className="text-primary font-bold">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={searchParams.next} notice={searchParams.notice} />
    </AuthShell>
  )
}
