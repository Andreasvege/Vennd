import Link from 'next/link'
import { ArrowRight, CircleCheck, Pencil } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { buttonClass } from '@/components/ui/button-styles'
import { LOG_ICON } from '@/components/log-icons'
import { RelativeDay } from '@/components/RelativeDay'
import { formatDate } from '@/domain/format'
import { isTagColor, tagStroke } from '@/lib/palette'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'
import { LogWithButton } from './LogWithButton'
import { FactList } from './FactList'
import { PhaseControl } from './PhaseControl'
import { RelationshipList } from './RelationshipList'
import { PhaseStripe } from './PhaseStripe'
import { ThreadList } from './ThreadList'

const section = 'border-t border-rule pt-6'

/**
 * Profilen, i den rekkefølgen du trenger den før et treff: hvem, hva du
 * bør spørre om, hva du husker om dem, og hva dere har gjort. Delt mellom
 * den fulle siden og arket over kartet.
 */
type Log = PersonProfileData['logs'][number]

// En logg i margen-tidslinjen, med trådene den lukket og åpnet.
function LogItem({ entry }: { entry: Log }) {
  const Icon = LOG_ICON[entry.type ?? 'OTHER']
  return (
    <li className="relative border-l border-rule pb-6 pl-6 last:pb-0">
      <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink" />
      <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
        <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
        {entry.type && <span className="font-medium">{t.logType[entry.type]}</span>}
        <RelativeDay date={entry.date} className="text-ink-muted" />
        {entry.others.length > 0 && (
          <span className="text-ink-muted">· {t.person.with(entry.others.map((o) => o.name).join(' og '))}</span>
        )}
      </div>
      {entry.body && <p className="mt-1.5 font-display text-[16px] leading-relaxed">{entry.body}</p>}
      {(entry.threadsClosed.length > 0 || entry.threadsOpened.length > 0) && (
        <ul className="mt-2 flex flex-col gap-1 text-[14px] text-ink-muted">
          {entry.threadsClosed.map((th) => (
            <li key={th.id} className="flex flex-wrap items-center gap-1.5">
              <span className="line-through">{th.title}</span>
              {th.resolution && (
                <>
                  <ArrowRight aria-hidden size={13} strokeWidth={1.75} />
                  <span className="text-ink">{th.resolution}</span>
                </>
              )}
            </li>
          ))}
          {entry.threadsOpened.map((th) => (
            <li key={th.id} className={th.status === 'CLOSED' ? 'line-through' : ''}>
              {t.thread.askAbout(th.title)}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function PersonProfile({ person }: { person: PersonProfileData }) {
  // Historikken: logger og tråder lukket for hånd, nyeste først.
  const history = [
    ...person.logs.map((entry) => ({ kind: 'log' as const, id: entry.id, date: new Date(entry.date), entry })),
    ...person.closedByHand.map((th) => ({
      kind: 'closed' as const,
      id: th.id,
      date: new Date(th.closedAt ?? 0),
      title: th.title,
      resolution: th.resolution,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

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
          {person.type === 'ROMANTIC' && (
            <div className="mt-2 flex max-w-sm flex-col gap-3">
              {person.phase && <PhaseStripe phases={person.phases} current={person.phase} />}
              <PhaseControl personId={person.id} current={person.phase} />
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

      <section className={section}>
        <SectionHeading>{t.person.facts}</SectionHeading>
        <FactList personId={person.id} facts={person.facts} labels={person.factLabels} />
      </section>

      {person.notes && (
        <section className={section}>
          <SectionHeading>{t.person.notes}</SectionHeading>
          <p className="whitespace-pre-wrap font-display text-[18px] leading-relaxed">{person.notes}</p>
        </section>
      )}

      <section className={section}>
        <SectionHeading action={<LogWithButton personId={person.id} name={person.name} />}>
          {t.person.log}
        </SectionHeading>
        {history.length === 0 ? (
          <p className="text-[14px] text-ink-muted">{t.person.noLog}</p>
        ) : (
          <ol className="flex flex-col">
            {history.map((item) =>
              item.kind === 'closed' ? (
                <li key={item.id} className="relative border-l border-rule pb-6 pl-6 last:pb-0">
                  <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink-muted" />
                  <p className="flex flex-wrap items-center gap-x-2 text-[14px] text-ink-muted">
                    <CircleCheck aria-hidden size={14} strokeWidth={1.75} />
                    <span className="line-through">{item.title}</span>
                    {item.resolution && (
                      <>
                        <ArrowRight aria-hidden size={13} strokeWidth={1.75} />
                        <span className="text-ink">{item.resolution}</span>
                      </>
                    )}
                    <RelativeDay date={item.date} />
                  </p>
                </li>
              ) : (
                <LogItem key={item.id} entry={item.entry} />
              ),
            )}
          </ol>
        )}
      </section>

      <section className={section}>
        <SectionHeading>{t.relations.title}</SectionHeading>
        <RelationshipList personId={person.id} relationships={person.relationships} people={person.people} />
      </section>
    </article>
  )
}
