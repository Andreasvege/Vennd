'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { EditPersonModal } from '@/components/modals/EditPersonModal'
import type { Person } from '@/types'

// Personprofilsiden er en server-komponent. Denne lille klientøya gir den
// rediger- og slettemulighet uten at hele siden må bli klient.
export function PersonHeaderActions({ person }: { person: Person }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="glass" size="sm" onPress={() => setOpen(true)}>
        Rediger
      </Button>
      <EditPersonModal person={person} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
