'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RouterProvider } from 'react-aria-components'
import { SessionProvider } from 'next-auth/react'
import { readTheme, syncThemeColor } from '@/components/theme'
import { ComposerProvider } from '@/components/composer/ComposerProvider'
import { SearchProvider } from '@/components/search/SearchProvider'
import { ToastProvider } from '@/components/toast/ToastProvider'
import type { ComposerData } from '@/server/queries/composer'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
  }
}

/**
 * Alt klientsiden trenger rundt appen. RouterProvider lar react-aria-lenker
 * (f.eks. menyvalg med href) navigere med Next sin ruter i stedet for å
 * laste hele siden på nytt.
 */
export function Providers({ children, composer }: { children: React.ReactNode; composer: ComposerData | null }) {
  const router = useRouter()
  useEffect(() => syncThemeColor(readTheme()), [])
  return (
    <RouterProvider navigate={router.push}>
      <SessionProvider>
        <ToastProvider>
          <ComposerProvider data={composer}>
            {/* Innenfor skriving: «Skriv en logg» fra et tomt søk åpner skriv-arket.
                Uten innlogging (forsiden) finnes ingenting å søke i. */}
            {composer ? <SearchProvider>{children}</SearchProvider> : children}
          </ComposerProvider>
        </ToastProvider>
      </SessionProvider>
    </RouterProvider>
  )
}
