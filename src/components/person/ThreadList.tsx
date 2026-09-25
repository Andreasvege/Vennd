'use client'

import { useState, useTransition } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { RelativeDay } from '@/components/RelativeDay'
import { closeThread } from '@/server/actions/thread'
import { settle } from '@/server/actions/result'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'

type Thread = PersonProfileData['openThreads'][number]

/**
 * Det du bør spørre om: åpne tråder med personen. Sirkelen lukker tråden —
 * den er fulgt opp — og den forsvinner når siden friskes opp.
 */
export function ThreadList({ threads }: { threads: Thread[] }) {
  const [closing, setClosing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const close = (id: string) => {
    setClosing(id)
    setError('')
    startTransition(async () => {
      const result = await settle(closeThread({ threadId: id }))
      if (!result.ok) setError(t.errors[result.error])
      setClosing(null)
    })
  }

  return (
    <>
    {error && (
      <p role="alert" className="mb-3 text-[14px] text-redpencil">
        {error}
      </p>
    )}
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
              {/* Relativ dag i leserens tidssone, ikke serverens. */}
              <RelativeDay date={thread.createdAt} />
              {thread.others.length > 0 && ` · ${t.thread.withOthers(thread.others.map((o) => o.name).join(', '))}`}
            </span>
          </div>
        </li>
      ))}
    </ul>
    </>
  )
}
