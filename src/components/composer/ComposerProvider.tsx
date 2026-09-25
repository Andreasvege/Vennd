'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ComposerData } from '@/server/queries/composer'
import { Composer } from './Composer'
import { PlanSheet } from './PlanSheet'

import type { LogEntryType } from '@/types'
import { shouldIgnoreShortcut } from '@/components/shortcuts'

export type ComposerPreset = {
  personIds?: string[]
  type?: LogEntryType | null
  /** YYYY-MM-DD */
  date?: string
  text?: string
  /** Planen loggen følger opp («Hvordan gikk det?»). */
  planId?: string
}
type Open = (options?: ComposerPreset) => void
type OpenPlanner = (options?: { personIds?: string[] }) => void
const ComposerContext = createContext<Open>(() => {})
const PlannerContext = createContext<OpenPlanner>(() => {})

/** Åpne skriv-arket hvor som helst: `useComposer()({ personIds: [id] })`. */
export const useComposer = () => useContext(ComposerContext)
/** Åpne planlegg-arket: `usePlanner()({ personIds: [id] })`. */
export const usePlanner = () => useContext(PlannerContext)


/**
 * Eier skriv-arket og snarveien N. Dataene (personer og åpne tråder) kommer
 * fra rot-layouten og friskes opp med resten av appen etter hver handling.
 */
export function ComposerProvider({ data, children }: { data: ComposerData | null; children: React.ReactNode }) {
  // Ny nøkkel per åpning: arket starter alltid rent (eller fra kladden).
  const [session, setSession] = useState<{ key: number; preset: ComposerPreset } | null>(null)

  const open = useCallback<Open>((options) => setSession({ key: Date.now(), preset: options ?? {} }), [])
  const [planning, setPlanning] = useState<{ key: number; personIds?: string[] } | null>(null)
  const openPlanner = useCallback<OpenPlanner>((options) => setPlanning({ key: Date.now(), personIds: options?.personIds }), [])

  useEffect(() => {
    if (!data) return
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if ((key !== 'n' && key !== 'p') || e.metaKey || e.ctrlKey || e.altKey) return
      if (shouldIgnoreShortcut(e)) return
      e.preventDefault()
      // N skriver om noe som har skjedd; P planlegger noe som skal skje.
      if (key === 'n') open()
      else openPlanner()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, open, openPlanner])

  return (
    <ComposerContext.Provider value={open}>
      <PlannerContext.Provider value={openPlanner}>
      {children}
      {data && planning && (
        <PlanSheet key={planning.key} data={data} personIds={planning.personIds} onClose={() => setPlanning(null)} />
      )}
      {data && session && (
        <Composer
          key={session.key}
          isOpen
          onClose={() => setSession(null)}
          data={data}
          preset={session.preset}
        />
      )}
      </PlannerContext.Provider>
    </ComposerContext.Provider>
  )
}
