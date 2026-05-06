'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Reminder, Person } from '@/types'

type ReminderWithPerson = Reminder & { person: Person }

type Props = {
  refreshKey: number
}

export function RemindersSidebar({ refreshKey }: Props) {
  const [reminders, setReminders] = useState<ReminderWithPerson[]>([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    async function fetchReminders() {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-auto' }),
      })
      const res = await fetch('/api/reminders')
      if (res.ok) {
        setReminders(await res.json())
      }
    }
    fetchReminders()
  }, [refreshKey])

  const dismiss = async (id: string) => {
    await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed: true }),
    })
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="absolute right-4 top-4 glass-card px-3 py-2 text-sm text-Text/60 hover:text-Text transition-colors z-10"
        title="Vis påminnelser"
      >
        🔔 {reminders.length > 0 && <span className="text-Accent font-bold">{reminders.length}</span>}
      </button>
    )
  }

  return (
    <div className="w-64 shrink-0 glass-card m-2 ml-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-Text/80">Påminnelser</h3>
        <button
          onClick={() => setVisible(false)}
          className="text-Text/30 hover:text-Text transition-colors text-lg leading-none"
          aria-label="Skjul"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {reminders.length === 0 ? (
          <p className="text-xs text-Text/30 text-center py-6">Ingen påminnelser</p>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="bg-white/4 rounded-xl p-3 flex flex-col gap-1.5 group"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">
                  {r.type === 'AUTO' ? '⏰' : '📌'}
                </span>
                <p className="text-xs text-Text/80 flex-1 leading-relaxed">{r.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/person/${r.personId}`}
                  className="text-xs text-Accent hover:text-Accent/80 transition-colors"
                >
                  {r.person.name} →
                </Link>
                <button
                  onClick={() => dismiss(r.id)}
                  className="text-xs text-Text/30 hover:text-Text/60 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                >
                  Avvis
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
