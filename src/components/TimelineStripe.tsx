'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LogEntry, Person } from '@/types'

type LogEntryWithPerson = LogEntry & { person: Person }

const LOG_EMOJI: Record<string, string> = {
  MET: '☕',
  CALLED: '📞',
  MESSAGE: '💬',
  OTHER: '📝',
}

type Props = {
  refreshKey: number
  onAddLog: () => void
}

export function TimelineStripe({ refreshKey, onAddLog }: Props) {
  const [entries, setEntries] = useState<LogEntryWithPerson[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/log?limit=10')
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
  }, [refreshKey])

  const formatDate = (d: string | Date) => {
    const date = new Date(d)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'I dag'
    if (diffDays === 1) return 'I går'
    if (diffDays < 7) return `${diffDays} dager siden`
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
  }

  if (entries.length === 0 && !expanded) {
    return (
      <div className="mx-4 mt-2 px-4 py-2 glass-card flex items-center gap-3 text-sm text-Text/40">
        <span>Ingen kontakter logget ennå</span>
        <button onClick={onAddLog} className="text-Accent hover:text-Accent/80 transition-colors ml-auto">
          + Logg kontakt
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-2 glass-card overflow-hidden transition-all duration-300">
      {/* Collapsed strip */}
      <div
        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-4 flex-1 overflow-hidden">
          {entries.slice(0, 4).map((entry: LogEntryWithPerson) => (
            <div key={entry.id} className="flex items-center gap-1.5 text-sm whitespace-nowrap text-Text/70">
              <span>{LOG_EMOJI[entry.type]}</span>
              <span className="font-medium text-Text">{entry.person.name}</span>
              <span className="text-Text/40 text-xs">{formatDate(entry.date)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-Text/40 text-sm shrink-0">
          {entries.length > 4 && <span className="text-xs">+{entries.length - 4} til</span>}
          <span
            className="transition-transform duration-200 inline-block"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
          {entries.map((entry: LogEntryWithPerson) => (
            <Link
              key={entry.id}
              href={`/person/${entry.personId}`}
              className="flex items-start gap-3 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group"
            >
              <span className="text-base mt-0.5">{LOG_EMOJI[entry.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-Text text-sm group-hover:text-Accent transition-colors">
                    {entry.person.name}
                  </span>
                  <span className="text-Text/40 text-xs">{formatDate(entry.date)}</span>
                </div>
                {entry.notes && (
                  <p className="text-xs text-Text/50 truncate">{entry.notes}</p>
                )}
              </div>
            </Link>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); onAddLog() }}
            className="text-xs text-Accent hover:text-Accent/80 transition-colors text-left px-2 py-1"
          >
            + Logg ny kontakt
          </button>
        </div>
      )}
    </div>
  )
}
