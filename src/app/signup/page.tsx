import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'
import SignupForm from '@/components/auth/SignupForm'
import { getEnabledProviders } from '@/lib/auth-providers'

export const metadata = { title: 'Sign up – Weekendr' }

export default async function SignupPage({ searchParams }: { searchParams: { next?: string } }) {
  const providers = await getEnabledProviders()
  return (
    <AuthShell
      title="Join Weekendr"
      subtitle="Find youth events near you – or host your own."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm next={searchParams.next} providers={providers} />
    </AuthShell>
  )
}
