'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Checkbox } from 'react-aria-components'
import { Button, CheckMark, checkRow, Toggle } from '@/components/ui'
import { formatDate } from '@/domain/format'
import { parseVCards } from '@/domain/import/vcard'
import { contactStatus, type KnownPerson } from '@/domain/import/match'
import { importContacts, type ContactImportResult } from '@/server/actions/import'
import { settle } from '@/server/actions/result'
import { tagStroke, isTagColor } from '@/lib/palette'
import { FileDrop } from './FileDrop'
import { t } from '@/i18n'

type Tag = { id: string; name: string; color: string }

// Bursdag uten år lagres som år 1900 (se birthdays.ts): da vises bare dag og måned.
const birthdayText = (iso: string) =>
  iso.startsWith('1900-')
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
    : formatDate(new Date(`${iso}T12:00:00Z`))

export function ContactImport({ persons, tags }: { persons: KnownPerson[]; tags: Tag[] }) {
  const [text, setText] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tagIds, setTagIds] = useState<string[]>([])
  const [remind, setRemind] = useState(false)
  const [result, setResult] = useState<ContactImportResult | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const rows = useMemo(
    () => (text === null ? [] : parseVCards(text).map((c) => ({ ...c, status: contactStatus(c, persons) }))),
    [text, persons],
  )
  const importable = rows.filter((r) => r.status.kind !== 'exists')

  const load = (value: string) => {
    const parsed = parseVCards(value).map((c) => ({ ...c, status: contactStatus(c, persons) }))
    setText(value)
    setResult(null)
    setError(parsed.length ? '' : t.import.noContacts)
    setSelected(new Set(parsed.filter((r) => r.status.kind !== 'exists').map((r) => r.key)))
  }

  const toggle = (key: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })

  const submit = () => {
    const chosen = importable.filter((r) => selected.has(r.key))
    setError('')
    startTransition(async () => {
      const res = await settle(
        importContacts({
          // Kuttes til grensene serveren godtar, så én lang notat ikke stopper hele importen.
          contacts: chosen.map(({ name, birthday, phone, email, note }) => ({
            name: name.slice(0, 120),
            birthday,
            phone: phone?.slice(0, 200) ?? null,
            email: email?.slice(0, 200) ?? null,
            note: note?.slice(0, 10_000) ?? null,
          })),
          tagIds,
          remind,
        }),
      )
      if (!res.ok) return setError(t.errors[res.error])
      setResult(res.data)
      setText(null)
    })
  }

  if (result) {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <p className="font-display text-[19px] text-ink">{t.import.doneContacts(result.created, result.birthdays, result.skipped)}</p>
        <div className="flex gap-3">
          <Link href="/kart" className="text-[15px] text-pen underline-offset-4 hover:underline">
            {t.import.toMap}
          </Link>
          <button type="button" onClick={() => setResult(null)} className="text-[15px] text-ink-muted underline-offset-4 hover:underline">
            {t.import.otherFile}
          </button>
        </div>
      </div>
    )
  }

  if (text === null || rows.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <FileDrop label={t.import.dropContacts} hint={t.import.howContacts} accept={['text/vcard', 'text/x-vcard', '.vcf']} onText={load} />
        {error && <p className="text-[14px] text-redpencil">{error}</p>}
      </div>
    )
  }

  const count = importable.filter((r) => selected.has(r.key)).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] text-ink-muted">
        <span>{t.import.selected(count, rows.length)}</span>
        <div className="flex gap-1">
          <Button variant="quiet" size="sm" onPress={() => setSelected(new Set(importable.map((r) => r.key)))}>
            {t.import.selectNew}
          </Button>
          <Button variant="quiet" size="sm" onPress={() => setSelected(new Set())}>
            {t.import.selectNone}
          </Button>
          <Button variant="quiet" size="sm" onPress={() => setText(null)}>
            {t.import.otherFile}
          </Button>
        </div>
      </div>

      {/* relative: avkrysningsboksenes skjulte felt er absolutt plassert og må holde
              seg inne i lista. Ellers havner de langt ned på siden, lager tom plass,
              og nettleseren scroller dit når du trykker. */}
          <ul className="relative flex max-h-[50vh] flex-col divide-y divide-rule overflow-y-auto overscroll-contain border-y border-rule">
        {rows.map((r) => {
          const exists = r.status.kind === 'exists'
          return (
            <li key={r.key} className="px-1">
              <Checkbox
                isSelected={!exists && selected.has(r.key)}
                isDisabled={exists}
                onChange={(on) => toggle(r.key, on)}
                className={`${checkRow} py-1 data-[disabled]:cursor-default`}
              >
                {exists ? <span className="size-5 shrink-0" /> : <CheckMark />}
                <span className={`min-w-0 flex-1 truncate ${exists ? 'text-ink-muted' : 'text-ink'}`}>{r.name}</span>
                {r.birthday && <span className="hidden shrink-0 text-[13px] text-ink-muted sm:inline">{birthdayText(r.birthday)}</span>}
                <span className="shrink-0 text-[12px] text-ink-muted">{t.import.status[r.status.kind]}</span>
              </Checkbox>
            </li>
          )
        })}
      </ul>

      {importable.length === 0 ? (
        <p className="text-[15px] text-ink-muted">{t.import.allExist}</p>
      ) : (
        <>
          {tags.length > 0 && (
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-[13px] text-ink-muted">{t.import.tags}</legend>
              {tags.map((tag) => (
                <Checkbox
                  key={tag.id}
                  isSelected={tagIds.includes(tag.id)}
                  onChange={(on) => setTagIds((prev) => (on ? [...prev, tag.id] : prev.filter((x) => x !== tag.id)))}
                  className={checkRow}
                >
                  <CheckMark />
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: tagStroke(isTagColor(tag.color) ? tag.color : 'stone') }} />
                  {tag.name}
                </Checkbox>
              ))}
            </fieldset>
          )}

          <Toggle label={t.import.remind} description={t.import.remindHint} isSelected={remind} onChange={setRemind} />

          {error && <p role="alert" className="text-[14px] text-redpencil">{error}</p>}
          <div className="flex justify-end border-t border-rule pt-4">
            <Button variant="primary" isDisabled={count === 0 || pending} onPress={submit}>
              {t.import.importContacts(count)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
