'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ComposerData } from '@/server/queries/composer'
import { Composer } from './Composer'

type Open = (options?: { personIds?: string[] }) => void
const ComposerContext = createContext<Open>(() => {})

/** Åpne skriv-arket hvor som helst: `useComposer()({ personIds: [id] })`. */
export const useComposer = () => useContext(ComposerContext)

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Eier skriv-arket og snarveien N. Dataene (personer og åpne tråder) kommer
 * fra rot-layouten og friskes opp med resten av appen etter hver handling.
 */
export function ComposerProvider({ data, children }: { data: ComposerData | null; children: React.ReactNode }) {
  // Ny nøkkel per åpning: arket starter alltid rent (eller fra kladden).
  const [session, setSession] = useState<{ key: number; personIds?: string[] } | null>(null)

  const open = useCallback<Open>((options) => setSession({ key: Date.now(), personIds: options?.personIds }), [])

  useEffect(() => {
    if (!data) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target) || document.querySelector('[role="dialog"]')) return
      e.preventDefault()
      open()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, open])

  return (
    <ComposerContext.Provider value={open}>
      {children}
      {data && session && (
        <Composer
          key={session.key}
          isOpen
          onClose={() => setSession(null)}
          data={data}
          presetPersonIds={session.personIds}
        />
      )}
    </ComposerContext.Provider>
  )
}
