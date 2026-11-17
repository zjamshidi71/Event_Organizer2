import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireUser('/my-weekend')
  return children
}
