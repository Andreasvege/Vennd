'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ComposerData } from '@/server/queries/composer'
import { Composer } from './Composer'
import { PlanSheet, type PlanDraft } from './PlanSheet'
import { LogEditSheet, type LogDraft } from './LogEditSheet'
import type { LogEntryType } from '@/types'
import { shouldIgnoreShortcut } from '@/components/shortcuts'
import { useSuggestionWatch } from '@/components/suggestions/useSuggestionWatch'

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
type OpenPlanner = (options?: { personIds?: string[]; plan?: PlanDraft }) => void
type EditLog = (log: LogDraft) => void
const ComposerContext = createContext<Open>(() => {})
const PlannerContext = createContext<OpenPlanner>(() => {})
const LogEditorContext = createContext<EditLog>(() => {})

/** Åpne skriv-arket hvor som helst: `useComposer()({ personIds: [id] })`. */
export const useComposer = () => useContext(ComposerContext)
/** Åpne planlegg-arket: `usePlanner()({ personIds: [id] })`, eller endre en plan: `({ plan })`. */
export const usePlanner = () => useContext(PlannerContext)
/** Rett eller slett en logg: `useLogEditor()(log)`. */
export const useLogEditor = () => useContext(LogEditorContext)


/**
 * Eier skriv-arket og snarveien N. Dataene (personer og åpne tråder) kommer
 * fra rot-layouten og friskes opp med resten av appen etter hver handling.
 */
export function ComposerProvider({ data, children }: { data: ComposerData | null; children: React.ReactNode }) {
  // Ny nøkkel per åpning: arket starter alltid rent (eller fra kladden).
  const [session, setSession] = useState<{ key: number; preset: ComposerPreset } | null>(null)

  const watchSuggestions = useSuggestionWatch(data?.claude ?? false)
  const open = useCallback<Open>((options) => setSession({ key: Date.now(), preset: options ?? {} }), [])
  const [planning, setPlanning] = useState<{ key: number; personIds?: string[]; plan?: PlanDraft } | null>(null)
  const openPlanner = useCallback<OpenPlanner>((options) => setPlanning({ key: Date.now(), ...options }), [])
  const [editing, setEditing] = useState<LogDraft | null>(null)

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
      <LogEditorContext.Provider value={setEditing}>
      {children}
      {data && planning && (
        <PlanSheet key={planning.key} data={data} personIds={planning.personIds} plan={planning.plan} onClose={() => setPlanning(null)} />
      )}
      {data && editing && <LogEditSheet key={editing.id} data={data} log={editing} onClose={() => setEditing(null)} />}
      {data && session && (
        <Composer
          key={session.key}
          isOpen
          onClose={() => setSession(null)}
          onSaved={watchSuggestions}
          data={data}
          preset={session.preset}
        />
      )}
      </LogEditorContext.Provider>
      </PlannerContext.Provider>
    </ComposerContext.Provider>
  )
}
