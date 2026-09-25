'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { t } from '@/i18n'

const DESK = '(min-width: 1024px)'

/**
 * Rammen rundt en profil i panelsporet: en del av sidepanelet på PC, og et
 * helskjermsark på mobil. Samme rute begge steder; CSS skiller dem.
 *
 * På mobil dekker arket alt, så det oppfører seg som en dialog: fokus
 * flyttes inn, Escape lukker, og resten av siden er inert. Lukking går
 * tilbake dit du kom fra — arket vises bare etter myk navigasjon, så det
 * finnes alltid et forrige steg.
 */
export function PanelSheet({ children, label }: { children: React.ReactNode; label: string }) {
  const router = useRouter()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (window.matchMedia(DESK).matches) return
    const behind = [document.querySelector('header'), document.querySelector('main'), document.querySelector('nav[aria-label]')]
    behind.forEach((el) => el?.setAttribute('inert', ''))
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) router.back()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      behind.forEach((el) => el?.removeAttribute('inert'))
      window.removeEventListener('keydown', onKey)
    }
  }, [router])

  return (
    <section
      aria-label={label}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-paper pb-[env(safe-area-inset-bottom)] desk:static desk:z-auto desk:overflow-visible desk:bg-transparent"
    >
      <div className="relative px-5 pb-10 pt-6 desk:px-7">
        <Button
          ref={closeRef}
          variant="quiet"
          onPress={() => router.back()}
          aria-label={t.common.close}
          size="icon"
          className="absolute right-2 top-2 z-10"
        >
          <X aria-hidden size={20} strokeWidth={1.75} />
        </Button>
        {children}
      </div>
    </section>
  )
}
