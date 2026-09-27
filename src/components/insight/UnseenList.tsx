'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, PenLine } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { useComposer, usePlanner } from '@/components/composer/ComposerProvider'
import { formatDate } from '@/domain/format'
import type { Insight, UnseenPerson } from '@/server/queries/insight'
import { t } from '@/i18n'

const SHOWN = 6
const BANDS = ['year', 'half', 'quarter', 'never'] as const

function Row({ p }: { p: UnseenPerson }) {
  const openComposer = useComposer()
  const openPlanner = usePlanner()
  const meta = [p.lastContact && t.insight.last(formatDate(new Date(p.lastContact))), !p.reminds && t.insight.noReminder]
    .filter(Boolean)
    .join(' · ')
  return (
    // Uten påminnelse er det et valg, ikke glemsel: tonet ned, men med.
    // Avataren blir grå og navnet dempet; kontrasten holder seg lesbar.
    <li className="flex items-center gap-3 py-2.5">
      <Avatar name={p.name} tint={p.tint} src={p.photoUrl} size="md" decorative className={p.reminds ? undefined : 'grayscale'} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/person/${p.id}`}
          className={`block truncate font-display text-[17px] hover:underline ${p.reminds ? 'text-ink' : 'text-ink-muted'}`}
        >
          {p.name}
        </Link>
        {meta && <p className="truncate text-[13px] text-ink-muted">{meta}</p>}
      </div>
      <div className="flex shrink-0 items-center">
        <Button variant="quiet" size="icon" aria-label={`${t.insight.log}: ${p.name}`} onPress={() => openComposer({ personIds: [p.id] })}>
          <PenLine aria-hidden size={17} strokeWidth={1.75} />
        </Button>
        <Button variant="quiet" size="icon" aria-label={`${t.insight.plan}: ${p.name}`} onPress={() => openPlanner({ personIds: [p.id] })}>
          <CalendarPlus aria-hidden size={17} strokeWidth={1.75} />
        </Button>
      </div>
    </li>
  )
}

function Band({ title, people, review }: { title: string; people: UnseenPerson[]; review?: boolean }) {
  const [all, setAll] = useState(false)
  if (people.length === 0) return null
  const shown = all ? people : people.slice(0, SHOWN)
  return (
    <section className="flex flex-col">
      <h3 className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {title}
        <span className="tabular-nums tracking-normal">{people.length}</span>
        {/* Aldri logget: gå gjennom dem og anslå når dere sist så hverandre. */}
        {review && (
          <Link
            href={`/sorter/fyll?ids=${people.map((p) => p.id).join(',')}`}
            className="ml-auto text-[12px] normal-case tracking-normal text-ink underline underline-offset-4 outline-none hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-pen"
          >
            {t.enrich.reviewThese}
          </Link>
        )}
      </h3>
      <ul className="flex flex-col divide-y divide-rule">
        {shown.map((p) => (
          <Row key={p.id} p={p} />
        ))}
      </ul>
      {shown.length < people.length && (
        <Button variant="quiet" size="sm" className="self-start" onPress={() => setAll(true)}>
          {t.insight.showAll(people.length)}
        </Button>
      )}
    </section>
  )
}

/** «Hvem har du ikke sett?»: alle uten kontakt de siste tre månedene, i bånd. */
export function UnseenList({ unseen }: { unseen: Insight['unseen'] }) {
  const none = BANDS.every((b) => unseen[b].length === 0)
  if (none) return <p className="text-[15px] text-ink-muted">{t.insight.allSeen}</p>
  return (
    <div className="flex flex-col gap-6">
      {BANDS.map((b) => (
        <Band key={b} title={t.insight.bands[b]} people={unseen[b]} review={b === 'never'} />
      ))}
    </div>
  )
}
