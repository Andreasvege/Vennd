import Link from 'next/link'
import { RELATIONSHIP_LABELS } from '@/lib/relationship-colors'
import type { Person, Reminder, LogEntry } from '@/types'

const LOG_EMOJI: Record<string, string> = {
  MET: '☕',
  CALLED: '📞',
  MESSAGE: '💬',
  OTHER: '📝',
}

const LOG_LABELS: Record<string, string> = {
  MET: 'Møttes',
  CALLED: 'Ringte',
  MESSAGE: 'Melding',
  OTHER: 'Annet',
}

export type PersonWithHistory = Person & {
  logEntries: LogEntry[]
  reminders: Reminder[]
}

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })

function cadenceLabel(weeks: number | null): string {
  if (weeks === null) return 'ingen påminnelser'
  if (weeks === 1) return 'påminnelse hver uke'
  return `påminnelse hver ${weeks}. uke`
}

/**
 * Profilinnholdet, delt mellom den fulle siden og modalen som avskjærer
 * navigasjonen fra kartet. Server-komponent — den henter ingenting selv,
 * begge rutene sender inn ferdig data.
 */
export function PersonProfile({ person }: { person: PersonWithHistory }) {
  const initials = person.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 flex items-start gap-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0"
          style={{ backgroundColor: person.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold text-Text mb-1">{person.name}</h1>
            <Link
              href={`/person/${person.id}/edit`}
              className="shrink-0 glass-card px-3 py-1.5 text-sm text-Text/80 hover:text-Text transition-colors"
            >
              Rediger
            </Link>
          </div>
          <p className="text-sm text-Text/60 mb-1">
            {RELATIONSHIP_LABELS[person.type]} · {cadenceLabel(person.cadenceWeeks)}
          </p>
          {person.birthday && (
            <p className="text-sm text-Text/50">Bursdag: {formatDate(person.birthday)}</p>
          )}
          <p className="text-xs text-Text/30 mt-1">Lagt til {formatDate(person.createdAt)}</p>
        </div>
      </div>

      {person.notes && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-3">
            Notat
          </h2>
          <p className="text-Text/80 leading-relaxed whitespace-pre-wrap">{person.notes}</p>
        </div>
      )}

      {person.reminders.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-3">
            Påminnelser
          </h2>
          <div className="flex flex-col gap-2">
            {person.reminders.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-sm text-Text/70">
                <span>{r.type === 'AUTO' ? '⏰' : '📌'}</span>
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-4">
          Kontaktlogg
        </h2>
        {person.logEntries.length === 0 ? (
          <p className="text-Text/30 text-sm">Ingen loggede kontakter ennå.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {person.logEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-xl mt-0.5">{LOG_EMOJI[entry.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-Text">
                      {LOG_LABELS[entry.type]}
                    </span>
                    <span className="text-xs text-Text/40">{formatDate(entry.date)}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-Text/60 leading-relaxed">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
