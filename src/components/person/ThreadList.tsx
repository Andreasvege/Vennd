'use client'

import { useState, useTransition } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { formatDate } from '@/domain/format'
import { closeThread } from '@/server/actions/thread'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'

type Thread = PersonProfileData['openThreads'][number]

/**
 * Det du bør spørre om: åpne tråder med personen. Sirkelen lukker tråden —
 * den er fulgt opp — og den forsvinner når siden friskes opp.
 */
export function ThreadList({ threads }: { threads: Thread[] }) {
  const [closing, setClosing] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const close = (id: string) => {
    setClosing(id)
    startTransition(async () => {
      await closeThread({ threadId: id })
      setClosing(null)
    })
  }

  return (
    <ul className="flex flex-col gap-3">
      {threads.map((thread) => (
        <li key={thread.id} className="flex items-start gap-3">
          <AriaButton
            aria-label={t.thread.close(thread.title)}
            onPress={() => close(thread.id)}
            isDisabled={closing === thread.id}
            className="group -m-3 flex size-11 shrink-0 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
          >
            <span className="size-4 rounded-full border-[1.5px] border-ink transition-colors group-data-[hovered]:bg-ink/15 group-data-[disabled]:bg-ink" />
          </AriaButton>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[16px] leading-snug">{thread.title}</span>
            <span className="text-[13px] text-ink-muted">
              {[
                t.thread.since(formatDate(new Date(thread.createdAt))),
                thread.others.length > 0 && t.thread.withOthers(thread.others.map((o) => o.name).join(', ')),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
