import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-sm text-[14px] text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pen"
    >
      <ArrowLeft aria-hidden size={15} strokeWidth={1.75} />
      {children}
    </Link>
  )
}
