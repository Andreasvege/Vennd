'use client'

import { useState, useTransition } from 'react'
import { Circle, NotebookPen, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { acceptSuggestion, dismissSuggestion } from '@/server/actions/suggestion'
import { settle } from '@/server/actions/result'
import type { SuggestionItem } from '@/server/queries/suggestions'
import { t } from '@/i18n'

// Tråder tegnes som sirkler overalt i appen; fakta er notater; personer er personer.
const ICON = { THREAD: Circle, FACT: NotebookPen, PARTICIPANT: UserPlus, PERSON: UserPlus }

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
  }
}

/**
 * Forslag fra Claude, godtas eller avvises med ett trykk. Et forslag som er
 * besvart, forsvinner med en gang; siden hentes på nytt i bakgrunnen.
 */
export function SuggestionList({ items }: { items: SuggestionItem[] }) {
  const toast = useToast()
  const [answered, setAnswered] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()
  const shown = items.filter((s) => !answered.has(s.id))
  if (shown.length === 0) return null

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
        {t.suggestions.title}
        <span className="font-sans text-[12px] not-italic text-ink-muted">{t.suggestions.from}</span>
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
