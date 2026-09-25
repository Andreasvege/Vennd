'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { shouldIgnoreShortcut } from '@/components/shortcuts'
import { SearchPalette } from './SearchPalette'

const SearchContext = createContext<() => void>(() => {})

/** Åpne søket hvor som helst: `useSearch()()`. */
export const useSearch = () => useContext(SearchContext)

/**
 * Søket, med snarveiene ⌘K / Ctrl+K (overalt) og / (når du ikke skriver
 * i et felt og ingen dialog er åpen), slik N og P virker for skriving.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (shouldIgnoreShortcut(e)) return
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider value={open}>
      {children}
      <SearchPalette isOpen={isOpen} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}
