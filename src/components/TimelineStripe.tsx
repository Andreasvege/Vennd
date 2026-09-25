'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button as AriaButton, Disclosure, DisclosurePanel, Heading } from 'react-aria-components'
import { ChevronDown, PenLine } from 'lucide-react'
import { Button } from '@/components/ui'
import { LOG_ICON } from '@/components/log-icons'
import { relativeDay } from '@/domain/format'
import { t } from '@/i18n'
import type { LogEntry, Person } from '@/types'

type LogEntryWithPerson = LogEntry & { person: Person }

type Props = {
  refreshKey: number
  onAddLog: () => void
}

const COLLAPSED_COUNT = 4

/** De siste loggene som en linje over kartet, som kan brettes ut. */
export function TimelineStripe({ refreshKey, onAddLog }: Props) {
  const [entries, setEntries] = useState<LogEntryWithPerson[]>([])

  useEffect(() => {
    fetch('/api/log?limit=10')
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
  }, [refreshKey])

  const logButton = (
    <Button variant="quiet" size="sm" onPress={onAddLog} className="shrink-0">
      <PenLine aria-hidden size={15} strokeWidth={1.75} />
      {t.log.action}
    </Button>
  )

  if (entries.length === 0) {
    return (
      <div className="flex h-[52px] items-center gap-3 border-b border-rule px-4 text-[14px] text-ink-muted desk:px-8">
        <span className="flex-1">{t.log.empty}</span>
        {logButton}
      </div>
    )
  }

  return (
    <Disclosure className="group border-b border-rule">
      <div className="flex h-[52px] items-center gap-3 px-4 desk:px-8">
        <Heading className="min-w-0 flex-1 font-normal">
          <AriaButton
            slot="trigger"
            aria-label={t.log.recent}
            className="flex w-full min-w-0 items-center gap-5 rounded-sm text-left outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
          >
            <span className="flex h-5 min-w-0 flex-1 flex-wrap gap-x-5 overflow-hidden">
              {entries.slice(0, COLLAPSED_COUNT).map((entry) => {
                const Icon = LOG_ICON[entry.type]
                return (
                  <span key={entry.id} className="flex shrink-0 items-center gap-1.5 text-[14px]">
                    <Icon aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
                    <span className="font-display text-ink">{entry.person.name}</span>
                    <span className="text-[12px] text-ink-muted">{relativeDay(new Date(entry.date))}</span>
                  </span>
                )
              })}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[12px] text-ink-muted">
              {entries.length > COLLAPSED_COUNT && (
                <span className="hidden sm:inline">{t.log.more(entries.length - COLLAPSED_COUNT)}</span>
              )}
              <ChevronDown
                aria-hidden
                size={16}
                strokeWidth={1.75}
                className="transition-transform duration-150 group-data-[expanded]:rotate-180"
              />
            </span>
          </AriaButton>
        </Heading>
        {logButton}
      </div>

      <DisclosurePanel>
        <ul className="flex max-h-64 flex-col overflow-y-auto px-4 pb-3 desk:px-8">
          {entries.map((entry) => {
            const Icon = LOG_ICON[entry.type]
            return (
              <li key={entry.id}>
                <Link
                  href={`/person/${entry.personId}`}
                  className="flex items-start gap-3 rounded-[10px] px-2 py-2 outline-none transition-colors hover:bg-paper-raised focus-visible:ring-2 focus-visible:ring-pen"
                >
                  <Icon aria-hidden size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-muted" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-[15px]">{entry.person.name}</span>
                      <span className="text-[12px] text-ink-muted">{relativeDay(new Date(entry.date))}</span>
                    </span>
                    {entry.notes && <span className="truncate text-[13px] text-ink-muted">{entry.notes}</span>}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </DisclosurePanel>
    </Disclosure>
  )
}
