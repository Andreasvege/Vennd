'use client'

import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useComposer } from '@/components/composer/ComposerProvider'
import { t } from '@/i18n'

/** «Logg med Ingrid»: skriv-arket, med personen allerede valgt. */
export function LogWithButton({ personId, name }: { personId: string; name: string }) {
  const openComposer = useComposer()
  return (
    <Button variant="secondary" onPress={() => openComposer({ personIds: [personId] })}>
      <PenLine aria-hidden size={15} strokeWidth={1.75} />
      {t.today.logWith(name)}
    </Button>
  )
}
