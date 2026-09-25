import Link from 'next/link'
import { Avatar, EmptyState, SectionHeading } from '@/components/ui'
import { UnseenList } from '@/components/insight/UnseenList'
import { EnvironmentBars } from '@/components/insight/EnvironmentBars'
import { TallyChart } from '@/components/insight/TallyChart'
import { requireUserId } from '@/server/session'
import { getInsight, parsePeriod, PERIODS, type Period } from '@/server/queries/insight'
import { t } from '@/i18n'

type Props = { searchParams: Promise<{ periode?: string }> }

const TYPE_ORDER = ['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER'] as const

const segment =
  'flex min-h-11 items-center px-3 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pen desk:min-h-9'

function PeriodSwitch({ current }: { current: Period }) {
  return (
    <nav aria-label={t.insight.period} className="flex overflow-hidden rounded-[10px] border border-rule bg-paper-raised">
      {PERIODS.map((p) => (
        <Link
          key={p}
          href={p === 90 ? '/innsikt' : `/innsikt?periode=${p}`}
          aria-current={p === current ? 'page' : undefined}
          scroll={false}
          className={`${segment} ${p === current ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'}`}
        >
          {t.insight.periods[p]}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Innsikt: hvem du ikke har sett (alltid fra nå), og hvor tiden gikk i
 * perioden du velger. Perioden står i adressen, så siden tegnes på serveren.
 */
export default async function InsightPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const period = parsePeriod((await searchParams).periode)
  const insight = await getInsight(userId, period)
  const types = TYPE_ORDER.flatMap((k) => (insight.types[k] ? [t.insight.typeCount[k](insight.types[k])] : []))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-12 px-5 py-8">
      <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.insight.title}</h1>

      <section className="flex flex-col gap-4">
        <div>
          <SectionHeading>{t.insight.unseen}</SectionHeading>
          <p className="-mt-2 text-[14px] text-ink-muted">{t.insight.unseenLead}</p>
        </div>
        <UnseenList unseen={insight.unseen} />
      </section>

      <section className="flex flex-col gap-8 border-t border-rule pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[21px] italic leading-tight text-ink">{t.insight.time}</h2>
          <PeriodSwitch current={period} />
        </div>

        {insight.total === 0 ? (
          <EmptyState title={t.insight.empty} className="py-6" />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <SectionHeading as="h3">{t.insight.byTag}</SectionHeading>
              <EnvironmentBars environments={insight.environments} />
              {types.length > 0 && <p className="text-[15px] text-ink">{t.insight.types(types)}</p>}
            </div>

            <div className="flex flex-col">
              <SectionHeading as="h3">{t.insight.often}</SectionHeading>
              <ol className="flex flex-col divide-y divide-rule">
                {insight.often.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={p.name} tint={p.tint} src={p.photoUrl} size="sm" decorative />
                    <Link href={`/person/${p.id}`} className="min-w-0 flex-1 truncate text-[15px] text-ink hover:underline">
                      {p.name}
                    </Link>
                    <span className="shrink-0 text-[13px] tabular-nums text-ink-muted">
                      {[t.insight.times(p.count), p.every !== null && t.rhythm.every(p.every)].filter(Boolean).join(' · ')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col">
              <SectionHeading as="h3">{t.insight.weeks}</SectionHeading>
              <TallyChart weeks={insight.weeks} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
