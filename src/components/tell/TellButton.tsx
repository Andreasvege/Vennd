'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { TellSheet } from './TellSheet'
import { t } from '@/i18n'

/** «Fortell om Ingrid» på profilen: åpner arket der du skriver fritt. */
export function TellButton({ person }: { person: { id: string; name: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        <Sparkles aria-hidden size={15} strokeWidth={1.75} />
        {t.tell.open(person.name.split(' ')[0])}
      </Button>
      <TellSheet person={person} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
