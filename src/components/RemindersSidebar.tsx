'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import type { ReminderResponse } from '@/types'

type Props = {
  refreshKey: number
}

// Hvor lenge en utsettelse varer. Bevisst kort: poenget er «ikke nå», ikke
// «aldri» — vil du aldri bli minnet om noen, setter du kadens til av.
const SNOOZE_WEEKS = 1

export function RemindersSidebar({ refreshKey }: Props) {
  const [reminders, setReminders] = useState<ReminderResponse[]>([])
  const [visible, setVisible] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    // Ingen generate-auto lenger — GET beregner AUTO-påminnelsene selv.
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

  if (!visible) {
    return (
      <Button
        variant="glass"
        size="sm"
        onPress={() => setVisible(true)}
        aria-label="Vis påminnelser"
        className="absolute right-4 top-4 z-10"
      >
        🔔
        {reminders.length > 0 && (
          <span className="text-Accent font-bold">{reminders.length}</span>
        )}
      </Button>
    )
  }

  return (
    <div className="w-64 shrink-0 glass-card m-2 ml-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-Text/80">
          Påminnelser
          {reminders.length > 0 && (
            <span className="ml-1.5 text-Text/30 font-normal">{reminders.length}</span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setVisible(false)}
          aria-label="Skjul"
          className="-mr-2 text-lg leading-none"
        >
          ×
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {reminders.length === 0 ? (
          <p className="text-xs text-Text/30 text-center py-6">
            Ingen påminnelser. Alt er à jour.
          </p>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="bg-white/4 rounded-xl p-3 flex flex-col gap-1.5 group"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">{r.type === 'AUTO' ? '⏰' : '📌'}</span>
                <p className="text-xs text-Text/80 flex-1 leading-relaxed">{r.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/person/${r.personId}`}
                  className="text-xs text-Accent hover:text-Accent/80 transition-colors"
                >
                  {r.personName} →
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => snooze(r)}
                  isDisabled={busy === r.id}
                  className="text-xs ml-auto px-1.5 py-0.5 opacity-0 group-hover:opacity-100 data-[focus-visible]:opacity-100"
                >
                  {r.type === 'AUTO' ? 'Utsett' : 'Avvis'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
