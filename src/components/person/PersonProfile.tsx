import Link from 'next/link'
import { Bell, Pencil } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { buttonClass } from '@/components/ui/button-styles'
import { LOG_ICON } from '@/components/log-icons'
import { formatDate, relativeDay } from '@/domain/format'
import { TYPE_TINT } from '@/lib/palette'
import { t } from '@/i18n'
import { LogContactPanel } from './LogContactPanel'
import type { Person, Reminder, LogEntry } from '@/types'

export type PersonWithHistory = Person & {
  logEntries: LogEntry[]
  reminders: Reminder[]
}

const section = 'border-t border-rule pt-6'

/**
 * Profilinnholdet, delt mellom den fulle siden og arket som avskjærer
 * navigasjonen fra kartet. Server-komponent — den henter ingenting selv,
 * begge rutene sender inn ferdig data.
 */
export function PersonProfile({ person }: { person: PersonWithHistory }) {
  const meta = [
    t.cadence.summary(person.cadenceWeeks),
    person.birthday && t.person.birthdayLabel(formatDate(new Date(person.birthday))),
  ].filter(Boolean)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={person.name} tint={TYPE_TINT[person.type]} size="xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.14em] text-ink-muted">
            {t.relationType[person.type]}
          </p>
          <h1 className="font-display text-[34px] leading-[1.05] tracking-tight text-balance sm:text-[46px]">
            {person.name}
          </h1>
          <p className="text-[14px] text-ink-muted">{meta.join(' · ')}</p>
          <Link href={`/person/${person.id}/edit`} className={`${buttonClass('secondary')} mt-2 self-start`}>
            <Pencil aria-hidden size={15} strokeWidth={1.75} />
            {t.common.edit}
          </Link>
        </div>
      </header>

      {person.notes && (
        <section className={section}>
          <SectionHeading>{t.person.notes}</SectionHeading>
          <p className="whitespace-pre-wrap font-display text-[17px] leading-relaxed">{person.notes}</p>
        </section>
      )}

      {person.reminders.length > 0 && (
        <section className={section}>
          <SectionHeading>{t.person.reminders}</SectionHeading>
          <ul className="flex flex-col gap-2.5">
            {person.reminders.map((r) => (
              <li key={r.id} className="flex items-start gap-3 text-[15px]">
                <Bell aria-hidden size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-muted" />
                <span>{r.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={section}>
        <LogContactPanel personId={person.id} personName={person.name} />
        {person.logEntries.length === 0 ? (
          <p className="text-[14px] text-ink-muted">{t.person.noLog}</p>
        ) : (
          <ol className="flex flex-col">
            {person.logEntries.map((entry) => {
              const Icon = LOG_ICON[entry.type]
              return (
                // En tidslinje i margen: strek ned, blekkprikk per hendelse.
                <li key={entry.id} className="relative border-l border-rule pb-6 pl-6 last:pb-0">
                  <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink" />
                  <div className="flex items-center gap-2 text-[13px]">
                    <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
                    <span className="font-medium">{t.logType[entry.type]}</span>
                    <time dateTime={new Date(entry.date).toISOString()} className="text-ink-muted">
                      {relativeDay(new Date(entry.date))}
                    </time>
                  </div>
                  {entry.notes && (
                    <p className="mt-1.5 font-display text-[16px] leading-relaxed">{entry.notes}</p>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </article>
  )
}
