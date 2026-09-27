'use client'

import { useEffect, useState, useTransition } from 'react'
import { Circle, Link2, NotebookPen, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { acceptSuggestion, dismissSuggestion } from '@/server/actions/suggestion'
import { settle } from '@/server/actions/result'
import type { SuggestionItem } from '@/server/queries/suggestions'
import { useTrayLog } from './trayContext'
import { t } from '@/i18n'

// Tråder tegnes som sirkler overalt i appen; fakta er notater; personer er personer.
const ICON = { THREAD: Circle, FACT: NotebookPen, PARTICIPANT: UserPlus, PERSON: UserPlus, RELATIONSHIP: Link2 }

function describe(s: SuggestionItem): { text: string; detail: string } {
  switch (s.kind) {
    case 'THREAD':
      return { text: t.suggestions.thread(s.title), detail: s.people.join(', ') }
    case 'FACT':
      return { text: t.suggestions.fact(s.label, s.value), detail: s.person }
    case 'PARTICIPANT':
      return { text: t.suggestions.participant(s.person), detail: t.suggestions.inLog(s.log) }
    case 'PERSON':
      return { text: t.suggestions.person(s.name), detail: t.suggestions.inLog(s.log) }
    case 'RELATIONSHIP':
      return { text: t.suggestions.relationship(s.a.split(' ')[0], s.b.split(' ')[0], s.label), detail: `${s.a} · ${s.b}` }
  }
}

/**
 * Forslag fra Claude, godtas eller avvises med ett trykk. Et forslag som er
 * besvart, forsvinner med en gang; siden hentes på nytt i bakgrunnen.
 */
export function SuggestionList({
  items,
  title = t.suggestions.title,
  onAllAnswered,
  inTray = false,
}: {
  items: SuggestionItem[]
  title?: string
  /** Kalles når siste forslag er besvart (skuffen etter en logg lukker seg). */
  onAllAnswered?: () => void
  /** Skuffen selv; ellers skjules forslagene skuffen viser akkurat nå. */
  inTray?: boolean
}) {
  const trayLog = useTrayLog()
  const toast = useToast()
  const [answered, setAnswered] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()
  const shown = items.filter((s) => !answered.has(s.id) && (inTray || s.logId !== trayLog))
  const allAnswered = inTray && items.length > 0 && shown.length === 0
  useEffect(() => {
    if (allAnswered) onAllAnswered?.()
  }, [allAnswered, onAllAnswered])
  if (shown.length === 0) return null

  // Godta alle på én gang, i rekkefølge (en ny person før en tråd om henne).
  const acceptAll = () => {
    setError('')
    startTransition(async () => {
      for (const s of shown) {
        const res = await settle(acceptSuggestion(s.id))
        if (!res.ok) return setError(t.errors[res.error])
        setAnswered((prev) => new Set(prev).add(s.id))
      }
      toast(t.suggestions.acceptedAll(shown.length))
    })
  }

  const answer = (s: SuggestionItem, accept: boolean) => {
    setError('')
    setAnswered((prev) => new Set(prev).add(s.id))
    startTransition(async () => {
      const res = await settle(accept ? acceptSuggestion(s.id) : dismissSuggestion(s.id))
      if (!res.ok) {
        setAnswered((prev) => {
          const next = new Set(prev)
          next.delete(s.id)
          return next
        })
        setError(t.errors[res.error])
      } else if (accept) {
        toast(t.suggestions.accepted[s.kind])
      }
    })
  }

  return (
    <section className="flex flex-col">
      <h2 className="mb-2 flex items-baseline gap-2 font-display text-[21px] italic leading-tight text-ink">
        {title}
        <span className="font-sans text-[12px] not-italic text-ink-muted">{t.suggestions.from}</span>
        {shown.length > 1 && (
          <Button variant="quiet" size="sm" onPress={acceptAll} className="ml-auto">
            {t.suggestions.acceptAll}
          </Button>
        )}
      </h2>
      <ul className="flex flex-col divide-y divide-rule">
        {shown.map((s) => {
          const Icon = ICON[s.kind]
          const { text, detail } = describe(s)
          return (
            <li key={s.id} className="flex items-center gap-3 py-2">
              <Icon aria-hidden size={15} strokeWidth={1.75} className="shrink-0 text-ink-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-ink">{text}</span>
                <span className="block truncate text-[13px] text-ink-muted">{detail}</span>
              </span>
              <Button variant="secondary" size="sm" onPress={() => answer(s, true)}>
                {t.suggestions.accept}
              </Button>
              <Button variant="quiet" size="icon" aria-label={t.suggestions.dismissLabel(text)} onPress={() => answer(s, false)}>
                <X aria-hidden size={16} strokeWidth={1.75} />
              </Button>
            </li>
          )
        })}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </section>
  )
}
