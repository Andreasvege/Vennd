'use client'

import { useSyncExternalStore } from 'react'
import { ChipGroup } from '@/components/ui'
import { t } from '@/i18n'
import { applyTheme, readTheme, type ThemeChoice } from './theme'

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: t.settings.themeSystem },
  { value: 'light', label: t.settings.themeLight },
  { value: 'dark', label: t.settings.themeDark },
]

// Valget lever i localStorage og på <html>; React abonnerer i stedet for å
// kopiere det inn i state, så det aldri kommer i utakt.
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'system' as ThemeChoice)

  const choose = (next: ThemeChoice) => {
    applyTheme(next)
    listeners.forEach((fn) => fn())
  }

  return <ChipGroup label={t.settings.theme} value={theme} onChange={choose} options={OPTIONS} />
}
