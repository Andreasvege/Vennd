'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, MenuItem, MenuTrigger, Popover, Button as AriaButton } from 'react-aria-components'
import { Avatar, Button } from '@/components/ui'
import { t } from '@/i18n'

const links = [
  { href: '/', label: t.nav.map },
  { href: '/settings', label: t.nav.settings },
]

const menuItem =
  'block cursor-pointer rounded-[7px] px-3 py-2 text-[15px] text-ink outline-none data-[focused]:bg-pen-wash'

export function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="flex h-16 items-center gap-8 border-b border-rule px-4 desk:px-8">
      <Link
        href="/"
        className="font-display text-[24px] italic tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-pen rounded-sm"
      >
        {t.app.name}
      </Link>

      {user && (
        <nav aria-label="Hovedmeny" className="hidden desk:block">
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
          <Button variant="quiet" className="hidden desk:inline-flex" onPress={() => signOut()}>
            {t.nav.signOut}
          </Button>

          <span className="hidden desk:inline-flex">
            <Avatar name={user.name ?? t.common.you} src={user.image} size="md" />
          </span>

          {/* På mobil, der lenkene ikke får plass, er avataren menyen. */}
          <MenuTrigger>
            <AriaButton
              aria-label={t.nav.account}
              className="rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper desk:hidden"
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
