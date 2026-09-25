'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { t } from '@/i18n'

/**
 * Rammen rundt en profil i panelsporet: et helskjermsark på mobil og en
 * del av sidepanelet på PC. Samme rute begge steder; bare CSS skiller dem.
 */
export function PanelSheet({ children, label }: { children: React.ReactNode; label: string }) {
  const router = useRouter()
  return (
    <section
      aria-label={label}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-paper pb-[env(safe-area-inset-bottom)] desk:static desk:z-auto desk:overflow-visible desk:bg-transparent"
    >
      <div className="relative px-5 pb-10 pt-6 desk:px-7">
        <Button
          variant="quiet"
          onPress={() => router.push('/')}
          aria-label={t.common.close}
          className="absolute right-2 top-2 z-10 size-11 px-0"
        >
          <X aria-hidden size={20} strokeWidth={1.75} />
        </Button>
        {children}
      </div>
    </section>
  )
}
