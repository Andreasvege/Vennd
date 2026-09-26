'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox, Disclosure, DisclosurePanel, Heading, Button as AriaButton } from 'react-aria-components'
import { ChevronRight } from 'lucide-react'
import { Avatar, Button, CheckMark, checkRow, EmptyState, TextField } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { fold } from '@/domain/search'
import { archivePersons, restorePerson } from '@/server/actions/sort'
import { settle } from '@/server/actions/result'
import type { SortingData } from '@/server/queries/sorting'
import { t } from '@/i18n'

/**
 * Venter-bunken: alle usorterte, med søk og massevalg. Legg flere i et
 * miljø, sorter dem én og én, eller ta dem ut av kartet.
 */
export function WaitingList({ data }: { data: SortingData }) {
  const router = useRouter()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()

  const q = fold(query.trim())
  const shown = q ? data.unsorted.filter((p) => fold(p.name).includes(q)) : data.unsorted
  // Et valg som ikke lenger står i bunken (sortert eller tatt ut), teller ikke.
  const ids = data.unsorted.filter((p) => selected.has(p.id)).map((p) => p.id)

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const archive = () =>
    startTransition(async () => {
      setError('')
      const res = await settle(archivePersons(ids))
      if (!res.ok) return setError(t.errors[res.error])
      toast(t.sort.archivedDone(res.data.count))
      setSelected(new Set())
    })

  const restore = (id: string) =>
    startTransition(async () => {
      const res = await settle(restorePerson(id))
      if (!res.ok) setError(t.errors[res.error])
    })

  return (
    <div className="flex flex-col gap-5">
      {data.unsorted.length === 0 ? (
        <EmptyState title={t.sort.empty} className="py-8" />
      ) : (
        <>
          <TextField label={t.sort.searchPeople} type="search" value={query} onChange={setQuery} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[14px] text-ink-muted">
            <span>{t.sort.selected(ids.length)}</span>
            <Button variant="quiet" size="sm" onPress={() => setSelected(new Set(shown.map((p) => p.id)))}>
              {t.sort.selectAll}
            </Button>
          </div>
          <ul className="relative flex max-h-[55vh] flex-col divide-y divide-rule overflow-y-auto overscroll-contain border-y border-rule">
            {shown.map((p) => (
              <li key={p.id} className="px-1">
                <Checkbox isSelected={selected.has(p.id)} onChange={(on) => toggle(p.id, on)} className={`${checkRow} py-1`}>
                  <CheckMark />
                  <Avatar name={p.name} tint={p.tint} src={p.photoUrl} size="sm" decorative />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  {(p.phone || p.email) && <span className="hidden shrink-0 text-[12px] text-ink-muted sm:inline">{p.phone ?? p.email}</span>}
                </Checkbox>
              </li>
            ))}
          </ul>
          {error && (
            <p role="alert" className="text-[14px] text-redpencil">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" isDisabled={ids.length === 0 || busy} onPress={() => router.push(`/sorter/kort?ids=${ids.join(',')}`)}>
              {t.sort.sortSelected}
            </Button>
            <Button variant="secondary" isDisabled={ids.length === 0 || busy} onPress={() => router.push(`/sorter/miljo?ids=${ids.join(',')}`)}>
              {t.sort.addToGroup}
            </Button>
            <Button variant="quiet" isDisabled={ids.length === 0 || busy} onPress={archive}>
              {t.sort.archiveSelected}
            </Button>
          </div>
        </>
      )}

      {data.archived.length > 0 && (
        <Disclosure className="group border-t border-rule pt-4">
          <Heading level={2}>
            <AriaButton
              slot="trigger"
              className="flex min-h-11 items-center gap-2 rounded-sm text-[15px] text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
            >
              <ChevronRight aria-hidden size={16} strokeWidth={1.75} className="transition-transform group-data-[expanded]:rotate-90" />
              {t.sort.archived(data.archived.length)}
            </AriaButton>
          </Heading>
          <DisclosurePanel>
            <ul className="flex flex-col divide-y divide-rule">
              {data.archived.map((p) => (
                <li key={p.id} className="flex min-h-11 items-center justify-between gap-3 py-1">
                  <span className="truncate text-[15px] text-ink-muted">{p.name}</span>
                  <Button variant="quiet" size="sm" aria-label={t.sort.restoreLabel(p.name)} onPress={() => restore(p.id)} isDisabled={busy}>
                    {t.sort.restore}
                  </Button>
                </li>
              ))}
            </ul>
          </DisclosurePanel>
        </Disclosure>
      )}
    </div>
  )
}
