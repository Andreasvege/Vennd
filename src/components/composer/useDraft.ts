'use client'

import { useCallback } from 'react'

const KEY = 'composer-draft'

export type Draft = {
  text: string
  personIds: string[]
  newThreads: { title: string; personIds: string[] }[]
}

// Kladden lever i nettleseren til loggen er lagret: lukker mobilen arket
// midt i en setning, ligger teksten der neste gang. Lagring kan være
// blokkert (privat modus), så alt er pakket inn.
export function useDraft() {
  const load = useCallback((): Draft | null => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Draft) : null
    } catch {
      return null
    }
  }, [])

  const save = useCallback((draft: Draft) => {
    try {
      const empty = !draft.text.trim() && draft.personIds.length === 0 && draft.newThreads.length === 0
      if (empty) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, JSON.stringify(draft))
    } catch {}
  }, [])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {}
  }, [])

  return { load, save, clear }
}
