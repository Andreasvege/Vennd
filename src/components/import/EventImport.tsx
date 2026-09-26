'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Checkbox } from 'react-aria-components'
import { Button, CheckMark, checkRow, ChipGroup } from '@/components/ui'
import { formatDate, todayISO } from '@/domain/format'
import { parseEvents, type CalEvent } from '@/domain/import/ics'
import { eventStatus, matchEvent, type KnownPerson } from '@/domain/import/match'
import { importEvents, type EventImportResult } from '@/server/actions/import'
import { settle } from '@/server/actions/result'
import { FileDrop } from './FileDrop'
import { t } from '@/i18n'

type Existing = { logs: { date: Date; personIds: string[] }[]; plans: { at: Date; title: string }[] }
type Period = 'year' | 'all'

const YEAR_MS = 365 * 86_400_000

// Dagen hendelsen hører til i din kalender. Heldagshendelser er lagret kl. 12 UTC.
const dayOf = (e: CalEvent) => (e.allDay ? e.start.toISOString().slice(0, 10) : todayISO(e.start))

/** Kalenderen: passerte treff med folk du kjenner blir logger, kommende blir planer. */
export function EventImport({ persons, existing }: { persons: KnownPerson[]; existing: Existing }) {
  const [text, setText] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('year')
  const [deselected, setDeselected] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<EventImportResult | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  // «Nå» fastsettes når filen leses, så lista ikke endrer seg mens du ser på den.
  const [now, setNow] = useState(() => new Date())

  const names = useMemo(() => new Map(persons.map((p) => [p.id, p.name.split(' ')[0]])), [persons])
  const parsed = useMemo(() => (text === null ? [] : parseEvents(text)), [text])
  const recurring = parsed.filter((e) => e.recurring).length
  const rows = useMemo(
    () =>
      parsed
        .filter((e) => !e.recurring && (period === 'all' || e.start.getTime() >= now.getTime() - YEAR_MS))
        .map((e) => {
          const personIds = matchEvent(e, persons)
          return { ...e, personIds, status: eventStatus(e, personIds, existing, now) }
        })
        .filter((r) => r.personIds.length > 0)
        .sort((a, b) => b.start.getTime() - a.start.getTime()),
    [parsed, period, persons, existing, now],
  )
  // Nye rader er valgt; det du krysser av, huskes som et fravalg.
  const chosen = rows.filter((r) => !r.status.duplicate && !deselected.has(r.key))
  const logs = chosen.filter((r) => r.status.kind === 'log').length

  const load = (value: string) => {
    setText(value)
    setNow(new Date())
    setDeselected(new Set())
    setResult(null)
    setError(parseEvents(value).length ? '' : t.import.noEvents)
  }

  const submit = () => {
    setError('')
    startTransition(async () => {
      const res = await settle(
        importEvents({
          events: chosen.map((r) => ({
            kind: r.status.kind,
            // Kuttes til grensene serveren godtar, så én lang beskrivelse ikke stopper hele importen.
            title: r.title.slice(0, 500),
            description: r.description?.slice(0, 10_000) ?? null,
            personIds: r.personIds,
            date: dayOf(r),
            at: r.allDay ? null : r.start.toISOString(),
          })),
        }),
      )
      if (!res.ok) return setError(t.errors[res.error])
      setResult(res.data)
      setText(null)
    })
  }

  if (result) {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <p className="font-display text-[19px] text-ink">{t.import.doneEvents(result.logs, result.plans, result.skipped)}</p>
        <div className="flex gap-3">
          <Link href="/logg" className="text-[15px] text-pen underline-offset-4 hover:underline">
            {t.import.toLog}
          </Link>
          <button type="button" onClick={() => setResult(null)} className="text-[15px] text-ink-muted underline-offset-4 hover:underline">
            {t.import.otherFile}
          </button>
        </div>
      </div>
    )
  }

  if (text === null) {
    return (
      <div className="flex flex-col gap-3">
        <FileDrop label={t.import.dropCalendar} hint={t.import.howCalendar} accept={['text/calendar', '.ics']} onText={load} />
        {error && <p className="text-[14px] text-redpencil">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ChipGroup
          label={t.import.period}
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          options={[
            { value: 'year', label: t.import.lastYear },
            { value: 'all', label: t.import.everything },
          ]}
        />
        <Button variant="quiet" size="sm" onPress={() => setText(null)}>
          {t.import.otherFile}
        </Button>
      </div>

      {recurring > 0 && <p className="text-[13px] text-ink-muted">{t.import.skippedRecurring(recurring)}</p>}

      {rows.length === 0 ? (
        <p className="text-[15px] text-ink-muted">{t.import.noEvents}</p>
      ) : (
        <>
          <p className="text-[14px] text-ink-muted">{t.import.selected(chosen.length, rows.length)}</p>
          {/* relative: avkrysningsboksenes skjulte felt er absolutt plassert og må holde
              seg inne i lista. Ellers havner de langt ned på siden, lager tom plass,
              og nettleseren scroller dit når du trykker. */}
          <ul className="relative flex max-h-[50vh] flex-col divide-y divide-rule overflow-y-auto overscroll-contain border-y border-rule">
            {rows.map((r) => {
              const dup = r.status.duplicate
              return (
                <li key={r.key} className="px-1">
                  <Checkbox
                    isSelected={!dup && !deselected.has(r.key)}
                    isDisabled={dup}
                    onChange={(on) =>
                      setDeselected((prev) => {
                        const next = new Set(prev)
                        if (on) next.delete(r.key)
                        else next.add(r.key)
                        return next
                      })
                    }
                    className={`${checkRow} py-1.5 data-[disabled]:cursor-default`}
                  >
                    {dup ? <span className="size-5 shrink-0" /> : <CheckMark />}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className={`truncate ${dup ? 'text-ink-muted' : 'text-ink'}`}>{r.title || t.import.untitled}</span>
                      <span className="truncate text-[13px] text-ink-muted">
                        {formatDate(new Date(`${dayOf(r)}T12:00:00Z`))} · {r.personIds.map((id) => names.get(id)).join(', ')}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-muted">
                      {dup ? t.import.status.duplicate : t.import.willBe[r.status.kind]}
                    </span>
                  </Checkbox>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {rows.length > 0 && rows.every((r) => r.status.duplicate) && <p className="text-[15px] text-ink-muted">{t.import.allExist}</p>}
      {error && <p role="alert" className="text-[14px] text-redpencil">{error}</p>}
      {rows.some((r) => !r.status.duplicate) && (
        <div className="flex justify-end border-t border-rule pt-4">
          <Button variant="primary" isDisabled={chosen.length === 0 || pending} onPress={submit}>
            {t.import.importEvents(logs, chosen.length - logs)}
          </Button>
        </div>
      )}
    </div>
  )
}
