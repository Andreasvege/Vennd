'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, MenuItem, MenuTrigger, Popover, Button as AriaButton } from 'react-aria-components'
import { Layers, PenLine, Search } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { useComposer } from '@/components/composer/ComposerProvider'
import { useSearch } from '@/components/search/SearchProvider'
import { t } from '@/i18n'

const links = [
  { href: '/', label: t.nav.map },
  { href: '/logg', label: t.nav.log },
  { href: '/innsikt', label: t.nav.insight },
  { href: '/sorter', label: t.nav.sort },
  { href: '/settings', label: t.nav.settings },
]

const menuItem =
  'block cursor-pointer rounded-[7px] px-3 py-2 text-[15px] text-ink outline-none data-[focused]:bg-pen-wash'

export function AppHeader({ unsorted = 0 }: { unsorted?: number }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const openComposer = useComposer()
  const openSearch = useSearch()

  return (
    <header className="flex h-16 items-center gap-8 border-b border-rule px-4 desk:px-8">
      <Link
        href="/"
        className="font-display text-[26px] italic tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-pen rounded-sm"
      >
        {t.app.name}
      </Link>

      {user && (
        <nav aria-label={t.nav.main} className="hidden desk:block">
          <ul className="flex gap-7 text-[14px]">
            {links.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'underline-offset-[7px] decoration-[1.5px] transition-colors outline-none',
                      'focus-visible:ring-2 focus-visible:ring-pen rounded-sm',
                      active ? 'text-ink underline' : 'text-ink-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {l.label}
                    {l.href === '/sorter' && unsorted > 0 && (
                      <span className="ml-1.5 rounded-full bg-ink px-1.5 text-[11px] font-semibold text-paper no-underline">
                        <span className="sr-only">, </span>
                        {t.nav.waitingCount(unsorted)}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <div className="flex-1" />

      {user && (
        <div className="flex items-center gap-3">
          {/* Bygg kartet: på mobil et ikon her (fanelinja er full), med antallet som venter. */}
          <span className="desk:hidden">
            <Link
              href="/sorter"
              aria-label={unsorted ? t.nav.sortWaiting(unsorted) : t.nav.sort}
              aria-current={pathname.startsWith('/sorter') ? 'page' : undefined}
              className="relative flex size-11 items-center justify-center rounded-[10px] text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pen aria-[current=page]:text-ink"
            >
              <Layers aria-hidden size={20} strokeWidth={1.75} />
              {unsorted > 0 && (
                <span
                  aria-hidden
                  className="absolute right-0.5 top-1 flex min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-4 text-paper"
                >
                  {unsorted > 99 ? '99+' : unsorted}
                </span>
              )}
            </Link>
          </span>
          {/* Ikon på mobil, ikon og snarvei på PC. Omslagene styrer synligheten. */}
          <span className="desk:hidden">
            <Button variant="quiet" size="icon" onPress={openSearch} aria-label={t.search.open}>
              <Search aria-hidden size={20} strokeWidth={1.75} />
            </Button>
          </span>
          <span className="hidden desk:block">
            <Button variant="quiet" onPress={openSearch} aria-keyshortcuts="Meta+K">
              <Search aria-hidden size={16} strokeWidth={1.75} />
              {t.search.openHint}
            </Button>
          </span>
          <span className="hidden desk:block">
            <Button variant="primary" onPress={() => openComposer()}>
              <PenLine aria-hidden size={15} strokeWidth={1.75} />
              {t.composer.openHint}
            </Button>
          </span>
          {/* Omslaget styrer synligheten: knappens egen inline-flex ville
              ellers vunnet over «hidden». */}
          <span className="hidden desk:block">
            <Button variant="quiet" onPress={() => signOut()}>
              {t.nav.signOut}
            </Button>
          </span>

          <span className="hidden desk:inline-flex">
            <Avatar name={user.name ?? t.common.you} src={user.image} size="md" />
          </span>

          {/* På mobil, der lenkene ikke får plass, er avataren menyen. */}
          <MenuTrigger>
            <AriaButton
              aria-label={t.nav.account}
              className="flex size-11 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper desk:hidden"
            >
              <Avatar name={user.name ?? t.common.you} src={user.image} size="md" />
            </AriaButton>
            <Popover
              placement="bottom end"
              offset={8}
              className="min-w-44 rounded-[10px] border border-rule bg-paper-raised p-1 shadow-float outline-none"
            >
              <Menu className="outline-none">
                <MenuItem href="/settings" className={menuItem}>
                  {t.nav.settings}
                </MenuItem>
                <MenuItem onAction={() => signOut()} className={menuItem}>
                  {t.nav.signOut}
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        </div>
      )}
    </header>
  )
}
