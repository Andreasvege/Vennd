'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Avatar, Button, SectionHeading, Sheet } from '@/components/ui'
import { TYPE_TINT } from '@/lib/palette'
import { t } from '@/i18n'
import type { ReminderResponse } from '@/types'

// Hvor lenge en utsettelse varer. Bevisst kort: poenget er «ikke nå», ikke
// «aldri» — vil du aldri bli minnet om noen, setter du kadens til av.
const SNOOZE_WEEKS = 1

type ListProps = {
  reminders: ReminderResponse[]
  busy: string | null
  onSnooze: (r: ReminderResponse) => void
}

function ReminderList({ reminders, busy, onSnooze }: ListProps) {
  if (reminders.length === 0) {
    return <p className="py-2 text-[14px] text-ink-muted">{t.reminders.empty}</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-rule">
      {reminders.map((r) => (
        <li key={r.id} className="flex items-start gap-3 py-3.5">
          <Avatar name={r.personName} tint={TYPE_TINT[r.personType]} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link
              href={`/person/${r.personId}`}
              className="self-start rounded-sm font-display text-[17px] leading-snug text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pen"
            >
              {r.personName}
            </Link>
            <p className="text-[14px] leading-snug text-ink-muted">{r.message}</p>
            {/* Alltid synlig: knapper som bare dukker opp ved hover finnes ikke på touch. */}
            <Button
              variant="quiet"
              size="sm"
              onPress={() => onSnooze(r)}
              isDisabled={busy === r.id}
              className="-ml-2.5 mt-1 self-start"
            >
              {r.type === 'AUTO' ? t.reminders.snooze : t.reminders.dismiss}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Påminnelsene: et fast sidepanel på store skjermer, og en knapp som åpner
 * dem i et ark på mobil. Samme data og handlinger begge steder.
 */
export function RemindersPanel({ refreshKey }: { refreshKey: number }) {
  const [reminders, setReminders] = useState<ReminderResponse[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    // GET beregner AUTO-påminnelsene selv; ingenting lagres.
    async function load() {
      const res = await fetch('/api/reminders')
      if (res.ok) setReminders(await res.json())
    }
    load()
  }, [refreshKey])

  const snooze = async (r: ReminderResponse) => {
    setBusy(r.id)

    if (r.type === 'AUTO') {
      // AUTO-påminnelser er utledet, ikke rader. Utsettelsen lagres på
      // personen, som er det eneste stedet den kan overleve.
      const until = new Date()
      until.setDate(until.getDate() + SNOOZE_WEEKS * 7)
      await fetch(`/api/persons/${r.personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snoozedUntil: until.toISOString() }),
      })
    } else {
      await fetch(`/api/reminders/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      })
    }

    setReminders((prev) => prev.filter((x) => x.id !== r.id))
    setBusy(null)
  }

  const list = <ReminderList reminders={reminders} busy={busy} onSnooze={snooze} />

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
        <Button variant="secondary" onPress={() => setSheetOpen(true)} aria-label={t.reminders.open}>
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
