import Link from 'next/link'

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex flex-col items-center px-margin py-10 bg-surface">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link href="/home" className="font-jakarta text-headline-sm text-primary tracking-tight font-bold self-center">
          Weekendr
        </Link>
        <div className="text-center">
          <h1 className="font-jakarta text-headline-lg text-on-surface">{title}</h1>
          {subtitle && <p className="font-inter text-body-md text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-md">{children}</div>
        {footer && <div className="text-center font-inter text-body-md text-on-surface-variant">{footer}</div>}
      </div>
    </main>
  )
}
