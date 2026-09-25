'use client'

import { useCallback } from 'react'
import type { Proximity } from '@/server/queries/proximity'
import { t } from '@/i18n'
import { useToast } from './ToastProvider'

const first = (name: string) => name.split(' ')[0]

/** Sier fra når en ny relasjon gjorde verden mindre, med lenke til stien. */
export function useProximityNotice() {
  const toast = useToast()
  return useCallback(
    (proximities: Proximity[]) => {
      const p = proximities[0]
      if (!p) return
      const a = p.path[0].name
      const b = p.path.at(-1)!.name
      toast(t.smallWorld.notice(first(a), first(b), t.smallWorld.steps(p.path.length - 1)), {
        label: t.smallWorld.showPath,
        href: `/?sti=${p.path.map((x) => x.id).join(',')}`,
      })
    },
    [toast],
  )
}
