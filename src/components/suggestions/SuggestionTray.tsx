'use client'

import { useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button as AriaButton } from 'react-aria-components'
import type { SuggestionItem } from '@/server/queries/suggestions'
import { t } from '@/i18n'
import { SuggestionList } from './SuggestionList'

export type Tray = { logId: string; items: SuggestionItem[] | null }

/**
 * Rett etter at du har lagret en logg: «Claude leser …», og så det Claude
 * fant i akkurat den loggen, der du er, mens du husker hva du skrev. Det
 * du ikke svarer på, ligger også på I dag og profilene.
 */
export function SuggestionTray({ tray, onClose }: { tray: Tray; onClose: () => void }) {
  const empty = tray.items !== null && tray.items.length === 0
  // Ingenting å foreslå: si det kort, og gå.
  useEffect(() => {
    if (!empty) return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [empty, onClose])

  return (
    <aside
      aria-label={t.suggestions.tray}
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto max-w-md rounded-[14px] border border-rule bg-paper-raised p-4 shadow-float desk:bottom-6 desk:left-auto desk:right-6 desk:mx-0 desk:w-[420px]"
    >
      <AriaButton
        onPress={onClose}
        aria-label={t.common.close}
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
      >
        <X aria-hidden size={16} strokeWidth={1.75} />
      </AriaButton>
      {tray.items === null ? (
        <p className="flex items-center gap-2 pr-8 text-[14px] text-ink-muted">
          <Sparkles aria-hidden size={15} strokeWidth={1.75} className="animate-pulse" />
          {t.suggestions.reading}
        </p>
      ) : empty ? (
        <p className="pr-8 text-[14px] text-ink-muted">{t.suggestions.nothing}</p>
      ) : (
        <div className="max-h-[50dvh] overflow-y-auto pr-6">
          <SuggestionList items={tray.items} onAllAnswered={onClose} title={t.suggestions.foundInLog} inTray />
        </div>
      )}
    </aside>
  )
}
