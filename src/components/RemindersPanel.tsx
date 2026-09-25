'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Avatar, Button, SectionHeading, Sheet } from '@/components/ui'
import { closeThread } from '@/server/actions/thread'
import { snoozePerson } from '@/server/actions/person'
import type { ReminderItem } from '@/server/queries/reminders'
import { t } from '@/i18n'

// Hvor lenge en utsettelse varer. Bevisst kort: poenget er «ikke nå», ikke
// «aldri» — vil du aldri bli minnet om noen, setter du kadens til av.
const SNOOZE_WEEKS = 1

type ListProps = {
  reminders: ReminderItem[]
  onDismiss: (r: ReminderItem) => void
  busy: string | null
}

function ReminderList({ reminders, onDismiss, busy }: ListProps) {
  if (reminders.length === 0) {
    return <p className="py-2 text-[14px] text-ink-muted">{t.reminders.empty}</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-rule">
      {reminders.map((r) => (
        <li key={r.id} className="flex items-start gap-3 py-3.5">
          <Avatar name={r.personName} tint={r.tint} size="md" decorative />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link
              href={`/person/${r.personId}`}
              className="self-start rounded-sm font-display text-[18px] leading-snug text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pen"
            >
              {r.personName}
            </Link>
            <p className="text-[14px] leading-snug text-ink-muted">{r.message}</p>
            {r.ask && <p className="text-[14px] leading-snug text-ink">{t.thread.askAbout(r.ask)}</p>}
            {/* Alltid synlig: knapper som bare dukker opp ved hover finnes ikke på touch. */}
            <Button
              variant="quiet"
              size="sm"
              onPress={() => onDismiss(r)}
              isDisabled={busy === r.id}
              className="-ml-2.5 mt-1 self-start"
            >
              {r.kind === 'cadence' ? t.reminders.snooze : t.reminders.dismiss}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Påminnelsene: et fast sidepanel på store skjermer, og en knapp som åpner
 * dem i et ark på mobil. Dataene kommer fra serveren; å utsette eller avvise
 * er en handling som frisker opp siden.
 */
export function RemindersPanel({ reminders }: { reminders: ReminderItem[] }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const dismiss = (r: ReminderItem) => {
    setBusy(r.id)
    startTransition(async () => {
      if (r.kind === 'cadence') await snoozePerson(r.personId, SNOOZE_WEEKS)
      else await closeThread({ threadId: r.id })
      setBusy(null)
    })
  }

  const list = <ReminderList reminders={reminders} onDismiss={dismiss} busy={busy} />
  return (
    <>
      <aside
        aria-label={t.reminders.title}
        className="hidden w-[400px] shrink-0 overflow-y-auto border-l border-rule bg-paper-raised px-7 py-6 desk:block"
      >
        <SectionHeading>{t.reminders.title}</SectionHeading>
        {list}
      </aside>

      <div className="absolute right-4 top-4 z-10 desk:hidden">
        <Button variant="secondary" onPress={() => setSheetOpen(true)} aria-label={t.reminders.open(reminders.length)}>
          <Bell aria-hidden size={16} strokeWidth={1.75} />
          {reminders.length > 0 && <span className="tabular-nums">{reminders.length}</span>}
        </Button>
      </div>
      <Sheet isOpen={sheetOpen} onOpenChange={setSheetOpen} title={t.reminders.title}>
        {list}
      </Sheet>
    </>
  )
}
