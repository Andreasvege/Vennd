'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, PenLine } from 'lucide-react'
import { Avatar, Button, EmptyState, SectionHeading } from '@/components/ui'
import { useComposer } from '@/components/composer/ComposerProvider'
import { LOG_ICON } from '@/components/log-icons'
import { RelativeDay } from '@/components/RelativeDay'
import { closeThread } from '@/server/actions/thread'
import { snoozePerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { ReminderItem } from '@/server/queries/reminders'
import type { TodayData } from '@/server/queries/today'
import { t } from '@/i18n'

const SNOOZE_WEEKS = 1
// Flere enn dette blir en vegg, ikke en liste. De mest forfalte står først.
const REACH_SHOWN = 5

function ReminderRow({ r, onDismiss, busy }: { r: ReminderItem; onDismiss: () => void; busy: boolean }) {
  const openComposer = useComposer()
  return (
    <li className="flex items-start gap-3 py-4">
      <Avatar name={r.personName} tint={r.tint} size="md" decorative />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link
          href={`/person/${r.personId}`}
          className="self-start rounded-sm font-display text-[18px] leading-snug outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pen"
        >
          {r.personName}
        </Link>
        <p className="text-[14px] leading-snug text-ink-muted">{r.message}</p>
        {r.ask && <p className="text-[15px] leading-snug">{t.thread.askAbout(r.ask)}</p>}
        <div className="-ml-2.5 mt-1 flex flex-wrap gap-1">
          <Button variant="quiet" size="sm" onPress={() => openComposer({ personIds: [r.personId] })}>
            <PenLine aria-hidden size={14} strokeWidth={1.75} />
            {t.today.logWith(r.personName)}
          </Button>
          <Button variant="quiet" size="sm" onPress={onDismiss} isDisabled={busy}>
            {r.kind === 'cadence' ? t.reminders.snooze : t.reminders.dismiss}
          </Button>
        </div>
      </div>
    </li>
  )
}

/**
 * «I dag»: det viktigste først. Skriveboksen, så det som har en dato, så
 * hvem du bør ta kontakt med (og hva du kan spørre om), så det siste du
 * skrev. Er startskjermen på mobil og sidepanelet på PC.
 */
export function TodayView({ data }: { data: TodayData }) {
  const openComposer = useComposer()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)
  const reach = showAll ? data.reach : data.reach.slice(0, REACH_SHOWN)
  const hidden = data.reach.length - reach.length
  const [, startTransition] = useTransition()

  const dismiss = (r: ReminderItem) => {
    setBusy(r.id)
    setError('')
    startTransition(async () => {
      const result = await settle(
        r.kind === 'cadence' ? snoozePerson(r.personId, SNOOZE_WEEKS) : closeThread({ threadId: r.id }),
      )
      if (!result.ok) setError(t.errors[result.error])
      setBusy(null)
    })
  }

  if (data.isEmpty) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-6">
        <EmptyState
          title={t.today.emptyTitle}
          body={t.today.emptyBody}
          action={
            <Button variant="primary" size="lg" onPress={() => openComposer()}>
              <PenLine aria-hidden size={18} strokeWidth={1.75} />
              {t.today.emptyAction}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 px-5 py-6 desk:px-7">
      <h1 className="sr-only">{t.today.title}</h1>

      {/* Ser ut som et tekstfelt, men er en knapp: den åpner skriv-arket. */}
      <button
        type="button"
        onClick={() => openComposer()}
        className="flex min-h-14 w-full items-center gap-3 rounded-[16px] border border-rule bg-paper-raised px-4 text-left font-display text-[19px] italic text-ink-muted shadow-float outline-none transition-colors hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-pen desk:shadow-none"
      >
        <PenLine aria-hidden size={18} strokeWidth={1.75} className="shrink-0 not-italic" />
        {t.composer.prompt}
      </button>

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}

      {data.due.length > 0 && (
        <section>
          <SectionHeading>{t.today.upcoming}</SectionHeading>
          <ul className="flex flex-col divide-y divide-rule">
            {data.due.map((r) => (
              <ReminderRow key={r.id} r={r} onDismiss={() => dismiss(r)} busy={busy === r.id} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeading>{t.today.reach}</SectionHeading>
        {data.reach.length === 0 ? (
          <p className="text-[14px] text-ink-muted">{t.today.quiet}</p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-rule">
              {reach.map((r) => (
                <ReminderRow key={r.id} r={r} onDismiss={() => dismiss(r)} busy={busy === r.id} />
              ))}
            </ul>
            {hidden > 0 && (
              <Button variant="secondary" onPress={() => setShowAll(true)} className="mt-2">
                {t.today.showMore(hidden)}
              </Button>
            )}
          </>
        )}
      </section>

      {data.recent.length > 0 && (
        <section>
          <SectionHeading
            action={
              <Link
                href="/logg"
                className="inline-flex min-h-11 items-center gap-1 rounded-sm text-[14px] text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pen desk:min-h-0"
              >
                {t.today.seeAll}
                <ArrowRight aria-hidden size={14} strokeWidth={1.75} />
              </Link>
            }
          >
            {t.today.recent}
          </SectionHeading>
          <ul className="flex flex-col gap-4">
            {data.recent.map((entry) => {
              const Icon = LOG_ICON[entry.type ?? 'OTHER']
              return (
                <li key={entry.id} className="flex gap-3">
                  <Icon aria-hidden size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-muted" />
                  <div className="min-w-0">
                    <p className="text-[14px]">
                      {entry.participants.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && (i === entry.participants.length - 1 ? ' og ' : ', ')}
                          <Link href={`/person/${p.id}`} className="font-medium hover:underline">
                            {p.name}
                          </Link>
                        </span>
                      ))}
                      <span className="text-ink-muted"> · </span>
                      <RelativeDay date={entry.date} className="text-ink-muted" />
                    </p>
                    {entry.body && <p className="mt-0.5 line-clamp-2 font-display text-[16px] leading-snug">{entry.body}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
