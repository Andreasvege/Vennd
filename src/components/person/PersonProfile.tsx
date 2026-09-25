import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { buttonClass } from '@/components/ui/button-styles'
import { LOG_ICON } from '@/components/log-icons'
import { RelativeDay } from '@/components/RelativeDay'
import { formatDate } from '@/domain/format'
import { isTagColor, tagStroke } from '@/lib/palette'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'
import { LogContactPanel } from './LogContactPanel'
import { PhaseStripe } from './PhaseStripe'
import { ThreadList } from './ThreadList'

const section = 'border-t border-rule pt-6'

/**
 * Profilen, i den rekkefølgen du trenger den før et treff: hvem, hva du
 * bør spørre om, hva du husker om dem, og hva dere har gjort. Delt mellom
 * den fulle siden og arket over kartet.
 */
export function PersonProfile({ person }: { person: PersonProfileData }) {
  const meta = [
    t.cadence.summary(person.cadenceWeeks),
    person.birthday && t.person.birthdayLabel(formatDate(new Date(person.birthday))),
  ].filter(Boolean)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={person.name} tint={person.tint} src={person.photoUrl} size="xl" decorative />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.14em] text-ink-muted">
            {t.relationType[person.type]}
          </p>
          <h1 className="font-display text-[34px] leading-[1.05] tracking-tight text-balance sm:text-[46px]">
            {person.name}
          </h1>
          {person.tags.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
              {person.tags.map((tag) => (
                <li key={tag.id} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: tagStroke(isTagColor(tag.color) ? tag.color : 'stone') }}
                  />
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[14px] text-ink-muted">{meta.join(' · ')}</p>
          {person.type === 'ROMANTIC' && person.phase && (
            <div className="mt-2 max-w-sm">
              <PhaseStripe phases={person.phases} current={person.phase} />
            </div>
          )}
          <Link href={`/person/${person.id}/edit`} className={`${buttonClass('secondary')} mt-2 self-start`}>
            <Pencil aria-hidden size={15} strokeWidth={1.75} />
            {t.common.edit}
          </Link>
        </div>
      </header>

      {person.openThreads.length > 0 && (
        <section className={section}>
          <SectionHeading>{t.thread.ask}</SectionHeading>
          <ThreadList threads={person.openThreads} />
        </section>
      )}

      {person.facts.length > 0 && (
        <section className={section}>
          <SectionHeading>{t.person.facts}</SectionHeading>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {person.facts.map((fact) => (
              <div key={fact.id}>
                <dt className="text-[13px] text-ink-muted">{fact.label}</dt>
                <dd className="text-[16px]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {person.notes && (
        <section className={section}>
          <SectionHeading>{t.person.notes}</SectionHeading>
          <p className="whitespace-pre-wrap font-display text-[18px] leading-relaxed">{person.notes}</p>
        </section>
      )}

      <section className={section}>
        <LogContactPanel personId={person.id} personName={person.name} />
        {person.logs.length === 0 ? (
          <p className="text-[14px] text-ink-muted">{t.person.noLog}</p>
        ) : (
          <ol className="flex flex-col">
            {person.logs.map((entry) => {
              const Icon = LOG_ICON[entry.type ?? 'OTHER']
              return (
                // En tidslinje i margen: strek ned, blekkprikk per hendelse.
                <li key={entry.id} className="relative border-l border-rule pb-6 pl-6 last:pb-0">
                  <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink" />
                  <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
                    <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
                    {entry.type && <span className="font-medium">{t.logType[entry.type]}</span>}
                    <RelativeDay date={entry.date} className="text-ink-muted" />
                    {entry.others.length > 0 && (
                      <span className="text-ink-muted">
                        · {t.person.with(entry.others.map((o) => o.name).join(' og '))}
                      </span>
                    )}
                  </div>
                  {entry.body && (
                    <p className="mt-1.5 font-display text-[16px] leading-relaxed">{entry.body}</p>
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
