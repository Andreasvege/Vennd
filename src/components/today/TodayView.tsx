'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { buttonClass } from '@/components/ui/button-styles'
import { ArrowRight, CalendarPlus, Cake, Layers, PenLine } from 'lucide-react'
import { Avatar, Button, EmptyState, SectionHeading } from '@/components/ui'
import { useComposer, usePlanner } from '@/components/composer/ComposerProvider'
import { BriefSheet } from './BriefSheet'
import { SuggestionList } from '@/components/suggestions/SuggestionList'
import { useIsClient } from '@/components/useIsClient'
import { birthdayLabel, whenLabel } from './when'
import { cancelPlan } from '@/server/actions/plan'
import { todayISO } from '@/domain/format'
import type { BirthdayItem, PlanItem } from '@/server/queries/plans'
import { nextBirthday } from '@/domain/birthdays'
import { splitPlans } from '@/domain/plans'
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

function BirthdayRow({ b }: { b: BirthdayItem }) {
  // I nettleseren: «i dag» og «i morgen» etter din kalender, ikke serverens.
  const next = useIsClient() ? nextBirthday(new Date(b.birthday), new Date()) : { inDays: b.inDays, turns: b.turns }
  if (next.inDays > 14) return null
  return (
    <li className="flex items-center gap-3">
      <Cake aria-hidden size={16} strokeWidth={1.75} className="shrink-0 text-ink-muted" />
      <span className="text-[15px]">
        <Link href={`/person/${b.id}`} className="font-medium hover:underline">
          {b.name}
        </Link>{' '}
        {next.turns !== null ? t.birthdays.turns(next.turns) : t.birthdays.birthday} {birthdayLabel(next.inDays)}
      </span>
    </li>
  )
}

function PlanRow({ plan, children }: { plan: PlanItem; children: React.ReactNode }) {
  // Datoen formateres i nettleseren (lokal tid), aldri på serveren.
  const label = useIsClient() ? whenLabel(new Date(plan.at), plan.hasTime) : ''
  return (
    <li className="flex items-start gap-3 py-4">
      <div className="flex -space-x-2 pt-0.5">
        {plan.persons.slice(0, 3).map((p) => (
          <Avatar key={p.id} name={p.name} tint={p.tint} size="md" decorative className="ring-2 ring-paper" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-display text-[18px] leading-snug">{plan.title}</p>
        <p className="text-[14px] text-ink-muted">
          {[label, plan.persons.map((p) => p.name.split(' ')[0]).join(', ')].filter(Boolean).join(' · ')}
        </p>
        <div className="-ml-2.5 mt-1 flex flex-wrap gap-1">{children}</div>
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
  const openPlanner = usePlanner()
  // Flyttet, eller fikk nytt navn: samme ark som da den ble planlagt.
  const editPlan = (plan: PlanItem) =>
    openPlanner({
      plan: {
        id: plan.id,
        title: plan.title,
        personIds: plan.persons.map((p) => p.id),
        at: new Date(plan.at).toISOString(),
        hasTime: plan.hasTime,
        type: plan.type,
      },
    })
  const [brief, setBrief] = useState<PlanItem | null>(null)
  const { ahead } = data
  // Når et treff er «passert», avgjøres av din klokke: serveren (UTC) ville
  // holdt gårsdagens treff som kommende til langt på natt norsk tid.
  const { upcoming, awaiting } = splitPlans(ahead.plans, useIsClient() ? new Date() : new Date(ahead.now))
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
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sorter/sporsmal" className={buttonClass('primary', 'lg')}>
                {t.questions.start}
              </Link>
              <Button variant="secondary" size="lg" onPress={() => openComposer()}>
                <PenLine aria-hidden size={18} strokeWidth={1.75} />
                {t.today.emptyAction}
              </Button>
            </div>
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

      <Button variant="quiet" onPress={() => openPlanner()} className="-mt-5 -ml-2.5 self-start">
        <CalendarPlus aria-hidden size={16} strokeWidth={1.75} />
        {t.plans.plan}
      </Button>

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}

      {data.unsorted > 0 && (
        <Link
          href="/sorter"
          className="group flex items-center gap-3 rounded-[16px] border border-ink bg-ink p-4 text-paper outline-none transition-colors hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-pen focus-visible:ring-offset-2"
        >
          <Layers aria-hidden size={20} strokeWidth={1.5} className="shrink-0" />
          <span className="flex-1 text-[15px]">{t.sort.todayCard(data.unsorted)}</span>
          <span className="flex items-center gap-1 text-[14px] font-medium">
            {t.sort.begin}
            <ArrowRight aria-hidden size={15} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {/* Rett under skriveboksen: forslagene hører til det du nettopp skrev. */}
      <SuggestionList items={data.suggestions} />

      {awaiting.length > 0 && (
        <section>
          <SectionHeading>{t.plans.howDidItGo}</SectionHeading>
          <ul className="flex flex-col divide-y divide-rule">
            {awaiting.map((plan) => (
              <PlanRow key={plan.id} plan={plan}>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    openComposer({
                      personIds: plan.persons.map((p) => p.id),
                      type: plan.type,
                      date: todayISO(new Date(plan.at)),
                      text: `${plan.title}. `,
                      planId: plan.id,
                    })
                  }
                >
                  <PenLine aria-hidden size={14} strokeWidth={1.75} />
                  {t.plans.writeIt}
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  onPress={() =>
                    startTransition(async () => {
                      const result = await settle(cancelPlan(plan.id))
                      if (!result.ok) setError(t.errors[result.error])
                    })
                  }
                >
                  {t.plans.didntHappen}
                </Button>
                <Button variant="quiet" size="sm" onPress={() => editPlan(plan)}>
                  {t.plans.edit}
                </Button>
              </PlanRow>
            ))}
          </ul>
        </section>
      )}

      {(upcoming.length > 0 || data.due.length > 0) && (
        <section>
          <SectionHeading>{t.today.upcoming}</SectionHeading>
          <ul className="flex flex-col divide-y divide-rule">
            {upcoming.map((plan) => (
              <PlanRow key={plan.id} plan={plan}>
                <Button variant="quiet" size="sm" onPress={() => setBrief(plan)}>
                  {t.plans.prepare}
                </Button>
                <Button variant="quiet" size="sm" onPress={() => editPlan(plan)}>
                  {t.plans.edit}
                </Button>
              </PlanRow>
            ))}
            {data.due.map((r) => (
              <ReminderRow key={r.id} r={r} onDismiss={() => dismiss(r)} busy={busy === r.id} />
            ))}
          </ul>
        </section>
      )}

      {ahead.birthdays.length > 0 && (
        <section>
          <SectionHeading>{t.birthdays.title}</SectionHeading>
          <ul className="flex flex-col gap-3">
            {ahead.birthdays.map((b) => (
              <BirthdayRow key={b.id} b={b} />
            ))}
          </ul>
        </section>
      )}

      {brief && <BriefSheet plan={brief} briefs={ahead.briefs} onClose={() => setBrief(null)} />}

      <section>
        <SectionHeading>{t.today.reach}</SectionHeading>
        {data.reach.length === 0 && data.neverLogged.length === 0 ? (
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
            {data.neverLogged.length > 0 && (
              <Link
                href="/sorter/fyll?aldri=1"
                className="mt-3 flex items-center gap-3 rounded-[12px] border border-rule px-4 py-3 text-[14px] text-ink-muted outline-none transition-colors hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-pen"
              >
                <span className="flex-1">{t.today.neverLogged(data.neverLogged.map((r) => r.personName.split(' ')[0]))}</span>
                <span className="flex shrink-0 items-center gap-1 text-ink">
                  {t.today.estimate}
                  <ArrowRight aria-hidden size={14} strokeWidth={1.75} />
                </span>
              </Link>
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
