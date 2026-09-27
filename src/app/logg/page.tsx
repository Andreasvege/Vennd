import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LOG_ICON } from '@/components/log-icons'
import { RelativeDay } from '@/components/RelativeDay'
import { EmptyState } from '@/components/ui/EmptyState'
import { buttonClass } from '@/components/ui/button-styles'
import { requireUserId } from '@/server/session'
import { getLogPage } from '@/server/queries/log'
import { interpretFor, logFilter } from '@/server/queries/search'
import { snippet } from '@/domain/search'
import { Marked } from '@/components/Marked'
import { EditLogButton } from '@/components/composer/EditLogButton'
import { fieldControl } from '@/components/ui/field-styles'
import { Search } from 'lucide-react'
import { t } from '@/i18n'

type Props = { searchParams: Promise<{ for?: string; q?: string }> }

function parseCursor(raw?: string) {
  const [iso, id] = raw?.split('_') ?? []
  const date = iso ? new Date(iso) : null
  return date && !Number.isNaN(date.getTime()) && id ? { date, id } : undefined
}

const monthOf = (date: Date | string) =>
  new Date(date).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Dagboken: alt du har skrevet, nyeste først. Med `?q=` bare det som passer søket. */
export default async function LogPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const { for: cursor, q: rawQ } = await searchParams
  const q = rawQ?.trim() ?? ''
  const search = q ? (await interpretFor(userId, q)).interpretation : null
  const { entries, next } = await getLogPage(userId, parseCursor(cursor), search ? logFilter(search) : undefined)
  const withQ = q ? `&q=${encodeURIComponent(q)}` : ''

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.logPage.title}</h1>
        {/* Søk i loggen: et navn blir et filter på personen, et miljø på alle i det. */}
        <form action="/logg" role="search" className="relative mt-3">
          <label htmlFor="logg-sok" className="sr-only">
            {t.logPage.search}
          </label>
          <Search aria-hidden size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="logg-sok"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t.logPage.searchPlaceholder}
            className={`${fieldControl} appearance-none pl-9 hover:border-ink-muted/60 focus:border-pen focus:ring-2 focus:ring-pen focus:ring-offset-2 focus:ring-offset-paper`}
          />
        </form>
        {q && (
          <p className="flex flex-wrap items-baseline gap-x-3 text-[15px] text-ink-muted">
            {t.logPage.filtered(q)}
            <Link href="/logg" className="text-pen underline-offset-4 hover:underline">
              {t.logPage.clear}
            </Link>
          </p>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState title={q ? t.logPage.noHits : t.logPage.empty} />
      ) : (
        <ol className="flex flex-col">
          {entries.map((entry, i) => {
            const Icon = LOG_ICON[entry.type ?? 'OTHER']
            // En overskrift når måneden skifter, så en lang dagbok får kapitler.
            // Datoene står kl. 12 UTC, så måneden er den samme overalt.
            const month = monthOf(entry.date)
            const newMonth = i === 0 || monthOf(entries[i - 1].date) !== month
            return (
              <li key={entry.id} className="relative border-l border-rule pb-8 pl-6 last:pb-0">
                {newMonth && (
                  <h2 className="-ml-6 mb-4 bg-paper py-1 pl-6 font-display text-[19px] italic text-ink-muted first-letter:uppercase">
                    {month}
                  </h2>
                )}
                <span aria-hidden className="absolute -left-[3.5px] top-[7px] size-1.5 rounded-full bg-ink" />
                <p className="flex flex-wrap items-center gap-x-2 text-[14px]">
                  <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
                  {entry.participants.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && (i === entry.participants.length - 1 ? 'og ' : ', ')}
                      <Link href={`/person/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                    </span>
                  ))}
                  <RelativeDay date={entry.date} className="text-ink-muted" />
                  <EditLogButton
                    id={entry.id}
                    body={entry.body}
                    date={entry.date}
                    type={entry.type}
                    personIds={entry.participants.map((p) => p.id)}
                  />
                </p>
                {entry.body && (
                  <p className="mt-1.5 font-display text-[17px] leading-relaxed">
                    {search?.terms.length ? <Marked parts={snippet(entry.body, search.terms, Infinity)} />                     : entry.body}
                  </p>
                )}
                {(entry.threadsClosed.length > 0 || entry.threadsOpened.length > 0) && (
                  <ul className="mt-2 flex flex-col gap-1 text-[14px] text-ink-muted">
                    {entry.threadsClosed.map((th) => (
                      <li key={th.id} className="flex items-center gap-1.5">
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
                      <li key={th.id}>{t.thread.askAbout(th.title)}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {next && (
        <Link href={`/logg?for=${encodeURIComponent(next)}${withQ}`} className={`${buttonClass('secondary')} self-center`}>
          {t.logPage.older}
        </Link>
      )}
    </div>
  )
}
