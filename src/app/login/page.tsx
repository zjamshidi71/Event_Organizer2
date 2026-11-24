import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'
import LoginForm from '@/components/auth/LoginForm'
import SocialButtons from '@/components/auth/SocialButtons'
import { getEnabledProviders } from '@/lib/auth-providers'

export const metadata = { title: 'Log in – Weekendr' }

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; notice?: string } }) {
  const providers = await getEnabledProviders()
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
      <div className="flex flex-col gap-4">
        <SocialButtons providers={providers} next={searchParams.next} />
        <LoginForm next={searchParams.next} notice={searchParams.notice} />
      </div>
    </AuthShell>
  )
}
