'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button as AriaButton } from 'react-aria-components'
import { X } from 'lucide-react'
import { Avatar, Button, TextField } from '@/components/ui'
import { fieldLabel } from '@/components/ui/TextField'
import { buttonClass } from '@/components/ui/button-styles'
import { ParticipantPicker } from '@/components/composer/ParticipantPicker'
import { useToast } from '@/components/toast/ToastProvider'
import { QUESTIONS, type Question } from '@/domain/questions'
import { todayISO } from '@/domain/format'
import { answerQuestion } from '@/server/actions/questions'
import { settle } from '@/server/actions/result'
import type { TagColor } from '@/lib/palette'
import { t } from '@/i18n'

type Known = { id: string; name: string; tint: TagColor }
const NEW = 'new:'

function QuestionCard({
  question,
  everyone,
  onAnswered,
  onSkip,
}: {
  question: Question
  everyone: Known[]
  onAnswered: (count: number) => void
  onSkip: () => void
}) {
  const text = t.questions.items[question.id]
  const { effect } = question
  const [chosen, setChosen] = useState<string[]>([])
  const [fresh, setFresh] = useState<Known[]>([])
  const [groupName, setGroupName] = useState(text.group ?? '')
  const [error, setError] = useState('')
  const [busy, start] = useTransition()
  const byId = new Map([...everyone, ...fresh].map((p) => [p.id, p]))

  const save = () => {
    setError('')
    start(async () => {
      const res = await settle(
        answerQuestion({
          questionId: question.id,
          personIds: chosen.filter((id) => !id.startsWith(NEW)),
          newNames: chosen.filter((id) => id.startsWith(NEW)).map((id) => id.slice(NEW.length)),
          groupName: effect.group && groupName.trim() ? groupName.trim() : null,
          today: todayISO(),
        }),
      )
      if (!res.ok) return setError(t.errors[res.error])
      onAnswered(res.data.people)
    })
  }

  const what = [
    effect.group && groupName.trim() && t.questions.effects.group(groupName.trim()),
    effect.connectAll && chosen.length > 1 && t.questions.effects.connectAll,
    effect.cadenceWeeks && t.questions.effects.cadence(t.cadence.every(effect.cadenceWeeks)),
    effect.reachOut && t.questions.effects.reachOut,
  ].filter(Boolean)

  return (
    <article
      aria-labelledby={`q-${question.id}`}
      className="animate-card-in flex flex-col gap-6 rounded-[20px] border border-rule bg-paper-raised p-5 shadow-float sm:p-7"
    >
      <h1 id={`q-${question.id}`} className="font-display text-[28px] leading-[1.15] tracking-tight text-balance sm:text-[32px]">
        {text.question}
      </h1>

      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>{t.questions.people}</span>
        <p className="-mt-1 text-[13px] text-ink-muted">{t.questions.peopleHint}</p>
        <div className="flex flex-wrap items-center gap-2">
          {chosen.map((id) => {
            const p = byId.get(id)
            if (!p) return null
            return (
              <span key={id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink py-1 pl-1.5 pr-1 text-[14px] text-paper desk:min-h-9">
                <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                {p.name}
                <AriaButton
                  aria-label={t.composer.removePerson(p.name)}
                  onPress={() => setChosen((prev) => prev.filter((x) => x !== id))}
                  className="flex size-8 items-center justify-center rounded-full opacity-80 outline-none data-[hovered]:opacity-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-paper"
                >
                  <X aria-hidden size={14} strokeWidth={2} />
                </AriaButton>
              </span>
            )
          })}
          <ParticipantPicker
            persons={[...everyone, ...fresh]}
            selected={chosen}
            onAdd={(id) => setChosen((prev) => (prev.includes(id) ? prev : [...prev, id]))}
            // Nye navn lagres først når du svarer; hopper du over, blir ingen laget.
            onCreate={async (name) => {
              const id = `${NEW}${name.trim()}`
              setFresh((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, { id, name: name.trim(), tint: 'stone' }]))
              return id
            }}
          />
        </div>
      </div>

      {effect.group && (
        <TextField label={t.questions.groupName} value={groupName} onChange={setGroupName} className="max-w-64" />
      )}

      {what.length > 0 && chosen.length > 0 && (
        <div className="flex flex-col gap-1 text-[13px] text-ink-muted">
          <span className={fieldLabel}>{t.questions.what}</span>
          {what.map((line) => (
            <p key={String(line)}>{line}</p>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}

      <div className="-mx-5 -mb-5 flex items-center gap-2 rounded-b-[20px] border-t border-rule px-5 py-3 sm:-mx-7 sm:-mb-7 sm:px-7">
        <Button variant="quiet" size="sm" onPress={onSkip} isDisabled={busy}>
          {t.questions.skip}
        </Button>
        <Button variant="primary" size="lg" onPress={chosen.length ? save : onSkip} isDisabled={busy} className="ml-auto">
          {t.questions.next}
        </Button>
      </div>
    </article>
  )
}

/**
 * Spørsmålskort: spørsmål som henter folk ut av hukommelsen. Hvert svar
 * gir personer, og ofte et miljø, en nærhet eller en påminnelse på kjøpet.
 * Like nyttig den første kvelden som når kartet alt er stort.
 */
export function QuestionDeck({ everyone }: { everyone: Known[] }) {
  const toast = useToast()
  const [index, setIndex] = useState(0)
  const question = QUESTIONS[index]
  const next = () => setIndex((i) => i + 1)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-5 sm:px-5 sm:py-8">
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={t.questions.title}
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index}
          aria-valuetext={t.sort.progress(index, QUESTIONS.length)}
          className="h-1 flex-1 overflow-hidden rounded-full bg-rule"
        >
          <div className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out" style={{ width: `${(index / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="text-[13px] tabular-nums text-ink-muted">{t.sort.progress(index, QUESTIONS.length)}</span>
        <Link href="/sorter" className="text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          {t.sort.exit}
        </Link>
      </div>

      {question ? (
        <QuestionCard
          key={question.id}
          question={question}
          // Siden hentes på nytt etter hvert svar, så de du nettopp la inn,
          // kan velges på neste kort.
          everyone={everyone}
          onAnswered={(count) => {
            toast(t.questions.saved(count))
            next()
          }}
          onSkip={next}
        />
      ) : (
        <div className="animate-card-in flex flex-col items-center gap-4 rounded-[20px] border border-rule bg-paper-raised px-6 py-12 text-center">
          <h1 className="font-display text-[30px] leading-tight">{t.questions.doneTitle}</h1>
          <p className="max-w-sm text-[15px] text-ink-muted">{t.questions.doneBody}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/kart" className={buttonClass('primary', 'lg')}>
              {t.sort.seeMap}
            </Link>
            <Link href="/sorter/fyll" className={buttonClass('secondary', 'lg')}>
              {t.enrich.way.title}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
