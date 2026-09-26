'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { acceptLinks, dismissLink } from '@/server/actions/links'
import { settle } from '@/server/actions/result'
import type { LinkSuggestionItem } from '@/server/queries/links'
import { t } from '@/i18n'

const key = (s: LinkSuggestionItem) => `${s.a.id}|${s.b.id}`

/** Hva forslaget sier: Claudes etikett, ellers typen («Familie»), ellers «kjenner hverandre». */
function what(s: LinkSuggestionItem) {
  if (s.label) return s.label
  return s.type === 'FRIEND' ? t.links.knowEachOther : t.relationType[s.type].toLowerCase()
}

type Props = {
  items: LinkSuggestionItem[]
  /** På profilen: vis bare den andre personen, ikke paret. */
  personId?: string
}

/**
 * Forslag til forbindelser: hvem som trolig kjenner hverandre, og hvorfor.
 * Legg til eller avvis med ett trykk; besvarte forsvinner med en gang.
 */
export function LinkSuggestionList({ items, personId }: Props) {
  const toast = useToast()
  const [answered, setAnswered] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()
  const shown = items.filter((s) => !answered.has(key(s)))

  const hide = (keys: string[]) => setAnswered((prev) => new Set([...prev, ...keys]))
  const unhide = (keys: string[]) =>
    setAnswered((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => next.delete(k))
      return next
    })

  const accept = (list: LinkSuggestionItem[]) => {
    const keys = list.map(key)
    setError('')
    hide(keys)
    startTransition(async () => {
      const res = await settle(acceptLinks(list.map((s) => [s.a.id, s.b.id] as [string, string])))
      if (!res.ok) {
        unhide(keys)
        return setError(t.errors[res.error])
      }
      toast(t.links.added(res.data.created))
    })
  }

  const dismiss = (s: LinkSuggestionItem) => {
    setError('')
    hide([key(s)])
    startTransition(async () => {
      const res = await settle(dismissLink([s.a.id, s.b.id]))
      if (!res.ok) {
        unhide([key(s)])
        setError(t.errors[res.error])
      }
    })
  }

  if (shown.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-rule">
        {shown.map((s) => {
          const others = personId ? [s.a.id === personId ? s.b : s.a] : [s.a, s.b]
          const pair = t.links.pair(s.a.name, s.b.name)
          return (
            <li key={key(s)} className="flex items-center gap-3 py-2.5">
              <span className="flex shrink-0 -space-x-2">
                {others.map((p) => (
                  <Avatar key={p.id} name={p.name} tint={p.tint} src={p.photoUrl} size="sm" decorative />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-ink">
                  {personId ? others[0].name : pair}
                  <span className="text-ink-muted"> · {what(s)}</span>
                </span>
                <span className="block text-[13px] text-ink-muted">
                  {s.reason ?? t.links.because(s.shared, s.sharedCount - s.shared.length, s.surname)}
                  {s.fromClaude && <span className="ml-1.5 text-[11px] uppercase tracking-[0.12em]">{t.links.fromClaude}</span>}
                </span>
              </span>
              <Button variant="secondary" size="sm" onPress={() => accept([s])} isDisabled={busy}>
                {t.links.add}
              </Button>
              <Button variant="quiet" size="icon" aria-label={t.links.dismissLabel(pair)} onPress={() => dismiss(s)} isDisabled={busy}>
                <X aria-hidden size={16} strokeWidth={1.75} />
              </Button>
            </li>
          )
        })}
      </ul>
      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
