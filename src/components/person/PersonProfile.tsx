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
import { PersonAhead } from './PersonAhead'
import { pathHref } from '@/app/kart/sti'
import { PhaseStripe } from './PhaseStripe'
import { ThreadList } from './ThreadList'
import { rhythm } from '@/domain/insight'
import { gapsOf } from '@/domain/enrich'
import { SuggestionList } from '@/components/suggestions/SuggestionList'
import { EditLogButton } from '@/components/composer/EditLogButton'
import { LinkSuggestionList } from '@/components/links/LinkSuggestionList'

const section = 'border-t border-rule pt-6'

/**
 * Profilen, i den rekkefølgen du trenger den før et treff: hvem, hva du
 * bør spørre om, hva du husker om dem, og hva dere har gjort. Delt mellom
 * den fulle siden og arket over kartet.
 */
type Log = PersonProfileData['logs'][number]

// En logg i margen-tidslinjen, med trådene den lukket og åpnet.
function LogItem({ entry, personId }: { entry: Log; personId: string }) {
  const Icon = LOG_ICON[entry.type ?? 'OTHER']
  return (
    // Id-en er målet for søketreff (#logg-…).
    <li id={`logg-${entry.id}`} className="relative scroll-mt-24 border-l border-rule pb-6 pl-6 last:pb-0">
      <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink" />
      <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
        <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
        {entry.type && <span className="font-medium">{t.logType[entry.type]}</span>}
        <RelativeDay date={entry.date} className="text-ink-muted" />
        {entry.others.length > 0 && (
          <span className="text-ink-muted">· {t.person.with(entry.others.map((o) => o.name).join(' og '))}</span>
        )}
        <EditLogButton
          id={entry.id}
          body={entry.body}
          date={entry.date}
          type={entry.type}
          personIds={[personId, ...entry.others.map((o) => o.id)]}
        />
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

  const every = rhythm(person.logs.map((l) => new Date(l.date)))
  const meta = [
    t.cadence.summary(person.cadenceWeeks),
    every !== null && t.rhythm.together(t.rhythm.every(every)),
    person.birthday && t.person.birthdayLabel(formatDate(new Date(person.birthday))),
  ].filter(Boolean)

  // Det vi ikke vet ennå: en vei rett til «Fyll inn kartet» for henne.
  const imported: string[] = [t.import.phoneLabel, t.import.emailLabel]
  const gaps = gapsOf({
    ...person,
    tagIds: person.tags.map((tag) => tag.id),
    factCount: person.facts.filter((f) => !imported.includes(f.label)).length,
    relationshipCount: person.relationships.length,
    lastContact: person.logs.length ? person.logs[0].date : null,
  })

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={person.name} tint={person.tint} src={person.photoUrl} size="xl" decorative />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.14em] text-ink-muted">
            {/* Dine ord først («Fetter · Familie»); typen alene når du ikke har skrevet noe. */}
            {[person.relationLabel, t.relationType[person.type]].filter(Boolean).join(' · ')}
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
          <PersonAhead person={person} />
          {person.type === 'ROMANTIC' && (
            <div className="mt-2 flex max-w-sm flex-col gap-3">
              {person.phase && <PhaseStripe phases={person.phases} current={person.phase} />}
              <PhaseControl personId={person.id} current={person.phase} />
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link href={`/person/${person.id}/edit`} className={buttonClass('secondary')}>
              <Pencil aria-hidden size={15} strokeWidth={1.75} />
              {t.common.edit}
            </Link>
            {gaps.length > 0 && (
              <Link
                href={`/sorter/fyll?ids=${person.id}`}
                className="group flex items-center gap-1.5 rounded-[8px] text-[13px] text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pen"
              >
                <span>
                  {t.enrich.missingList(gaps.map((g) => t.enrich.gapNames[g]))}
                </span>
                <span className="text-ink underline underline-offset-4">{t.enrich.fillIn}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {person.suggestions.length > 0 && (
        <div className={section}>
          <SuggestionList items={person.suggestions} />
        </div>
      )}

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
                <LogItem key={item.id} entry={item.entry} personId={person.id} />
              ),
            )}
          </ol>
        )}
      </section>

      {person.proximities.length > 0 && (
        <section className={section}>
          <SectionHeading>{t.smallWorld.title}</SectionHeading>
          <ul className="flex flex-col gap-3">
            {person.proximities.map((p) => (
              <li key={p.b} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="flex flex-wrap items-center gap-1.5 text-[15px]">
                  {p.path.map((step, i) => (
                    <span key={step.id} className="flex items-center gap-1.5">
                      {i > 0 && <ArrowRight aria-hidden size={13} strokeWidth={1.75} className="text-redpencil" />}
                      {i === 0 ? (
                        <span>{step.name.split(' ')[0]}</span>
                      ) : (
                        <Link href={`/person/${step.id}`} className="hover:underline">
                          {step.name.split(' ')[0]}
                        </Link>
                      )}
                    </span>
                  ))}
                  <span className="text-[13px] text-ink-muted">· {t.smallWorld.steps(p.path.length - 1)}</span>
                </span>
                <Link
                  href={pathHref(p.path.map((s) => s.id))}
                  className="inline-flex min-h-11 items-center rounded-sm text-[14px] text-redpencil outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pen desk:min-h-0"
                >
                  {t.smallWorld.showOnMap}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={section}>
        <SectionHeading>{t.relations.title}</SectionHeading>
        <RelationshipList personId={person.id} relationships={person.relationships} people={person.people} />
      </section>

      {person.links.length > 0 && (
        <section className={section}>
          <SectionHeading>{t.links.profileTitle}</SectionHeading>
          <LinkSuggestionList items={person.links} personId={person.id} />
        </section>
      )}
    </article>
  )
}
