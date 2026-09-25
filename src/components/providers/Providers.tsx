'use client'

import { useRouter } from 'next/navigation'
import { RouterProvider } from 'react-aria-components'
import { SessionProvider } from 'next-auth/react'

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
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <RouterProvider navigate={router.push}>
      <SessionProvider>{children}</SessionProvider>
    </RouterProvider>
  )
}
