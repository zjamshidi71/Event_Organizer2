import { requireOrganizer } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Only logged-in organizers can open this page.
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireOrganizer('/organizer')
  return children
}
