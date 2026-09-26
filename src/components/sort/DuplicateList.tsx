'use client'

import { useState, useTransition } from 'react'
import { Radio, RadioGroup } from 'react-aria-components'
import { Avatar, Button, EmptyState } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { markNotSame, mergePersons } from '@/server/actions/merge'
import { settle } from '@/server/actions/result'
import type { DuplicateItem } from '@/server/queries/duplicates'
import { t } from '@/i18n'

const option =
  'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[12px] border border-rule p-3 outline-none transition-colors data-[hovered]:border-ink-muted data-[selected]:border-ink data-[selected]:ring-1 data-[selected]:ring-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen'

function DuplicateCard({ item }: { item: DuplicateItem }) {
  const toast = useToast()
  const [keep, setKeep] = useState(item.suggestedKeep)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()
  if (done) return null
  const people = [item.a, item.b]
  const kept = people.find((p) => p.id === keep)!
  const dropped = people.find((p) => p.id !== keep)!

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, message: string) =>
    startTransition(async () => {
      setError('')
      setDone(true)
      const res = await action()
      if (!res.ok) {
        setDone(false)
        setError(t.errors[(res.error as keyof typeof t.errors) ?? 'failed'])
      } else toast(message)
    })

  return (
    <li className="flex flex-col gap-3 rounded-[16px] border border-rule bg-paper-raised p-4 sm:p-5">
      <p className="text-[14px] text-ink-muted">{item.reason === 'same' ? t.dupes.reasonSame : t.dupes.reasonMiddle}</p>
      <RadioGroup value={keep} onChange={setKeep} aria-label={t.dupes.keepLabel} className="flex flex-col gap-2 sm:flex-row">
        {people.map((p) => (
          <Radio key={p.id} value={p.id} className={option}>
            <Avatar name={p.name} tint={p.tint} src={p.photoUrl} size="md" decorative />
            <span className="min-w-0">
              <span className="block truncate font-display text-[16px] text-ink">{p.name}</span>
              <span className="block text-[12px] text-ink-muted">{t.dupes.stats(p.logs, p.relations, p.group)}</span>
            </span>
          </Radio>
        ))}
      </RadioGroup>
      <p className="text-[13px] text-ink-muted">{t.dupes.explain(kept.name, dropped.name)}</p>
      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          isDisabled={busy}
          onPress={() => run(async () => settle(mergePersons({ keepId: kept.id, dropId: dropped.id, name: kept.name })), t.dupes.merged(kept.name))}
        >
          {t.dupes.merge}
        </Button>
        <Button
          variant="quiet"
          size="sm"
          className="ml-auto"
          isDisabled={busy}
          onPress={() => run(async () => settle(markNotSame([item.a.id, item.b.id])), t.dupes.keptApart)}
        >
          {t.dupes.notSame}
        </Button>
      </div>
    </li>
  )
}

/** Mulige duplikater, ett par om gangen: slå sammen, eller «ikke samme person». */
export function DuplicateList({ items }: { items: DuplicateItem[] }) {
  if (items.length === 0) return <EmptyState title={t.dupes.empty} className="py-8" />
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <DuplicateCard key={`${item.a.id}|${item.b.id}`} item={item} />
      ))}
    </ul>
  )
}
