'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ChartNoAxesColumn, Map, PenLine, Sun } from 'lucide-react'
import { useComposer } from '@/components/composer/ComposerProvider'
import { t } from '@/i18n'

const tab =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pen'

/** Fanelinjen på mobil: I dag, Kart, Logg og Innsikt, med Skriv tydelig i midten. */
export function BottomTabs() {
  const pathname = usePathname()
  const openComposer = useComposer()

  const link = (href: string, label: string, Icon: typeof Sun) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link href={href} aria-current={active ? 'page' : undefined} className={`${tab} ${active ? 'text-ink' : 'text-ink-muted'}`}>
        <Icon aria-hidden size={20} strokeWidth={active ? 2 : 1.75} />
        {label}
      </Link>
    )
  }

  return (
    <nav
      aria-label={t.nav.tabs}
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-rule bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm desk:hidden"
    >
      {link('/', t.nav.today, Sun)}
      {link('/kart', t.nav.map, Map)}
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={() => openComposer()}
          aria-label={t.composer.open}
          className="-mt-5 flex size-14 items-center justify-center rounded-full bg-ink text-paper shadow-float outline-none focus-visible:ring-2 focus-visible:ring-pen focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <PenLine aria-hidden size={22} strokeWidth={1.75} />
        </button>
      </div>
      {link('/logg', t.nav.log, BookOpen)}
      {link('/innsikt', t.nav.insight, ChartNoAxesColumn)}
    </nav>
  )
}
