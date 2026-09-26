'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Checkbox, Label, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Avatar, Button, CheckMark, checkRow, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { buttonClass } from '@/components/ui/button-styles'
import { missingPairs } from '@/domain/sorting'
import { fold } from '@/domain/search'
import { assignGroup } from '@/server/actions/sort'
import { settle } from '@/server/actions/result'
import type { SortingData } from '@/server/queries/sorting'
import { TagPicker, type PickerTag } from './TagPicker'
import { t } from '@/i18n'

type Connect = 'all' | 'pairs' | 'none'
// Små grupper kjenner som regel hverandre; i store blir «alle kjenner alle» uriktig og tett.
const ALL_BY_DEFAULT_UP_TO = 12

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Miljø for miljø: velg et miljø, kryss av hvem som hører til, og si om de
 * kjenner hverandre. Raskest for vennegjenger og familie.
 */
export function GroupFlow({ data, preselect = [] }: { data: SortingData; preselect?: string[] }) {
  const [tags, setTags] = useState<PickerTag[]>(data.tags)
  const [tagId, setTagId] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState<Set<string>>(new Set())
  const [connect, setConnect] = useState<Connect>('all')
  const [pairs, setPairs] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ added: number; relationships: number } | null>(null)
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()

  const unsortedIds = useMemo(() => new Set(data.unsorted.map((p) => p.id)), [data.unsorted])
  // Usorterte først (det er dem du rydder i), så de som alt står på kartet.
  const people = useMemo(
    () => [
      ...data.unsorted.map((p) => ({ id: p.id, name: p.name, tint: p.tint, tagIds: p.tagIds })),
      ...data.sorted,
    ],
    [data.unsorted, data.sorted],
  )
  const tag = tags.find((x) => x.id === tagId)
  const q = fold(query.trim())
  const shown = q ? people.filter((p) => fold(p.name).includes(q)) : people
  const chosen = people.filter((p) => members.has(p.id))
  const newLinks = missingPairs([...members], data.pairs).length

  const chooseTag = (ids: string[]) => {
    const id = ids[0] ?? null
    setTagId(id)
    if (!id) return
    // De som allerede er i miljøet, er krysset av; det samme er dem du valgte i bunken.
    const current = people.filter((p) => p.tagIds.includes(id)).map((p) => p.id)
    const next = new Set([...current, ...preselect])
    setMembers(next)
    setConnect(next.size <= ALL_BY_DEFAULT_UP_TO ? 'all' : 'none')
    setStep(2)
  }

  const toggle = (id: string, on: boolean) =>
    setMembers((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const save = () => {
    if (!tagId) return
    setError('')
    startTransition(async () => {
      const res = await settle(
        assignGroup({
          tagId,
          personIds: [...members],
          connect,
          pairs: connect === 'pairs' ? [...pairs].map((k) => k.split('|') as [string, string]) : undefined,
        }),
      )
      if (!res.ok) return setError(t.errors[res.error])
      setResult(res.data)
    })
  }

  const restart = () => {
    setResult(null)
    setTagId(null)
    setMembers(new Set())
    setPairs(new Set())
    setQuery('')
    setStep(1)
  }

  if (result) {
    return (
      <div role="status" className="animate-card-in flex flex-col items-start gap-4 rounded-[20px] border border-rule bg-paper-raised p-6">
        <h2 className="font-display text-[24px] leading-tight">{tag?.name}</h2>
        <p className="text-[15px]">{t.sort.groupDone(result.added, result.relationships)}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onPress={restart}>
            {t.sort.nextGroup}
          </Button>
          <Link href="/sorter/kort" className={buttonClass('secondary')}>
            {t.sort.toDeck}
          </Link>
          <Link href="/kart" className={buttonClass('quiet')}>
            {t.sort.seeMap}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[13px] uppercase tracking-[0.14em] text-ink-muted">{t.sort.step(step)}</p>

      {step === 1 && (
        <TagPicker
          label={t.sort.chooseGroup}
          tags={tags}
          value={tagId ? [tagId] : []}
          onChange={chooseTag}
          onCreated={(created) => setTags((prev) => [...prev, created])}
          selectionMode="single"
        />
      )}

      {step === 2 && tag && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[24px] leading-tight">{t.sort.whoBelongs(tag.name)}</h2>
          <TextField label={t.sort.searchPeople} type="search" value={query} onChange={setQuery} />
          <p className="-mt-2 text-[13px] text-ink-muted">
            {t.sort.members(members.size)} · {t.sort.unsortedFirst}
          </p>
          <ul className="relative flex max-h-[55vh] flex-col divide-y divide-rule overflow-y-auto overscroll-contain border-y border-rule">
            {shown.map((p) => (
              <li key={p.id} className="px-1">
                <Checkbox isSelected={members.has(p.id)} onChange={(on) => toggle(p.id, on)} className={`${checkRow} py-1`}>
                  <CheckMark />
                  <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  {unsortedIds.has(p.id) && <span className="shrink-0 text-[12px] text-ink-muted">{t.sort.unsortedBadge}</span>}
                </Checkbox>
              </li>
            ))}
          </ul>
          <div className="flex justify-between gap-3">
            <Button variant="quiet" onPress={() => setStep(1)}>
              {t.sort.back2}
            </Button>
            <Button variant="primary" onPress={() => setStep(3)}>
              {t.sort.continue}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && tag && (
        <div className="flex flex-col gap-5">
          <RadioGroup value={connect} onChange={(v) => setConnect(v as Connect)} className="flex flex-col gap-2">
            <Label className="font-display text-[24px] leading-tight">{t.sort.connectTitle}</Label>
            {(
              [
                ['all', t.sort.connectAll, t.sort.connectAllHint(newLinks)],
                ['pairs', t.sort.connectPairs, t.sort.connectPairsHint],
                ['none', t.sort.connectNone, t.sort.connectNoneHint],
              ] as const
            ).map(([value, label, hint]) => (
              <Radio
                key={value}
                value={value}
                className="flex cursor-pointer flex-col rounded-[12px] border border-rule px-4 py-3 outline-none transition-colors data-[hovered]:border-ink-muted data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
              >
                <span className="text-[15px] font-medium">{label}</span>
                <span className="text-[13px] opacity-75">{hint}</span>
              </Radio>
            ))}
          </RadioGroup>

          {connect === 'pairs' && (
            <ul className="flex flex-col gap-4">
              {chosen.map((p) => (
                <li key={p.id} className="flex flex-col gap-2">
                  <span className={fieldLabel}>{t.sort.knows}: {p.name}</span>
                  <ToggleButtonGroup
                    aria-label={`${t.sort.knows}: ${p.name}`}
                    selectionMode="multiple"
                    selectedKeys={chosen.filter((o) => o.id !== p.id && pairs.has(key(p.id, o.id))).map((o) => o.id)}
                    onSelectionChange={(keys) => {
                      const on = new Set([...keys].map(String))
                      setPairs((prev) => {
                        const next = new Set(prev)
                        for (const o of chosen) {
                          if (o.id === p.id) continue
                          if (on.has(o.id)) next.add(key(p.id, o.id))
                          else next.delete(key(p.id, o.id))
                        }
                        return next
                      })
                    }}
                    className="flex flex-wrap gap-2"
                  >
                    {chosen
                      .filter((o) => o.id !== p.id)
                      .map((o) => (
                        <ToggleButton key={o.id} id={o.id} className={chipBase}>
                          {o.name}
                        </ToggleButton>
                      ))}
                  </ToggleButtonGroup>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="text-[14px] text-redpencil">
              {error}
            </p>
          )}
          <div className="flex justify-between gap-3 border-t border-rule pt-4">
            <Button variant="quiet" onPress={() => setStep(2)}>
              {t.sort.back2}
            </Button>
            <Button variant="primary" size="lg" onPress={save} isDisabled={busy}>
              {busy ? t.common.saving : t.sort.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
