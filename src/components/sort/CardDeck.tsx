'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Label, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Undo2 } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { buttonClass } from '@/components/ui/button-styles'
import { ParticipantPicker } from '@/components/composer/ParticipantPicker'
import { formatDate } from '@/domain/format'
import { CLOSENESS, networkHints, pullRelated, type Closeness } from '@/domain/sorting'
import { createPerson } from '@/server/actions/person'
import { archivePersons, restorePerson, sortPerson } from '@/server/actions/sort'
import { settle } from '@/server/actions/result'
import type { SortingData, UnsortedPerson } from '@/server/queries/sorting'
import type { TagColor } from '@/lib/palette'
import { TagPicker, type PickerTag } from './TagPicker'
import { t } from '@/i18n'

type Known = { id: string; name: string; tint: TagColor; tagIds: string[] }
type Done = { id: string; archived: boolean }

const SUGGESTIONS = 12

// Bursdag uten år lagres som år 1900: da vises bare dag og måned.
const birthdayText = (d: Date) =>
  d.getUTCFullYear() === 1900
    ? d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    : formatDate(d)

function Card({
  person,
  tags,
  known,
  everyone,
  already,
  network,
  initialTags,
  onTagCreated,
  onSubmit,
  onSkip,
  onArchive,
  canSkip,
  busy,
}: {
  person: UnsortedPerson
  tags: PickerTag[]
  known: Known[]
  everyone: { id: string; name: string; tint: TagColor }[]
  /** Dem hun allerede er koblet til (f.eks. fra forrige kort). */
  already: Known[]
  /** Dem de hun kjenner, kjenner: flest felles først. */
  network: Known[]
  /** Miljøet hun får fra start: hennes egne, ellers det de hun kjenner deler. */
  initialTags: string[]
  onTagCreated: (tag: PickerTag) => void
  onSubmit: (form: { closeness: Closeness; tagIds: string[]; knows: string[] }) => void
  onSkip: () => void
  onArchive: () => void
  canSkip: boolean
  busy: boolean
}) {
  const [closeness, setCloseness] = useState<Closeness>('sometimes')
  const [tagIds, setTagIds] = useState<string[]>(initialTags)
  const [knows, setKnows] = useState<string[]>([])
  const [extra, setExtra] = useState<{ id: string; name: string; tint: TagColor }[]>([])

  // Forslag: de som står på kartet i samme miljø. Uten miljø: ingen gjetting.
  // Forslag: først nettverket (de hun kjenner, kjenner), så dem på kartet i
  // samme miljø. Dem hun allerede kjenner, står for seg over.
  const suggested = useMemo(() => {
    const skip = new Set([person.id, ...already.map((a) => a.id)])
    const inGroup = known.filter((k) => k.tagIds.some((id) => tagIds.includes(id)))
    const seen = new Set<string>()
    return [...network, ...inGroup]
      .filter((k) => !skip.has(k.id) && !seen.has(k.id) && seen.add(k.id))
      .slice(0, SUGGESTIONS)
  }, [known, network, already, person.id, tagIds])
  const chips = [
    ...suggested,
    ...[...everyone, ...extra].filter((p) => knows.includes(p.id) && !suggested.some((s) => s.id === p.id)),
  ]
  const meta = [
    person.birthday && t.sort.birthday(birthdayText(new Date(person.birthday))),
    person.phone,
    person.email,
  ].filter(Boolean)

  // ⌘↵ / Ctrl+↵: neste kort, hvor som helst i kortet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy) {
        e.preventDefault()
        onSubmit({ closeness, tagIds, knows })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeness, tagIds, knows, busy, onSubmit])

  return (
    <article
      aria-labelledby={`card-${person.id}`}
      className="animate-card-in flex flex-col gap-6 rounded-[20px] border border-rule bg-paper-raised p-5 shadow-float sm:p-7"
    >
      <header className="flex items-center gap-4">
        <Avatar name={person.name} tint={person.tint} src={person.photoUrl} size="xl" decorative />
        <div className="min-w-0">
          <h1 id={`card-${person.id}`} className="font-display text-[30px] leading-[1.05] tracking-tight text-balance sm:text-[36px]">
            {person.name}
          </h1>
          {meta.length > 0 && <p className="mt-1 text-[14px] text-ink-muted">{meta.join(' · ')}</p>}
        </div>
      </header>
      {person.notes && <p className="-mt-2 font-display text-[16px] italic leading-relaxed text-ink-muted">{person.notes}</p>}

      <RadioGroup value={closeness} onChange={(v) => setCloseness(v as Closeness)} className="flex flex-col gap-2">
        <Label className={fieldLabel}>{t.sort.closeness}</Label>
        <div className="grid grid-cols-2 gap-2">
          {CLOSENESS.map((c) => (
            <Radio
              key={c}
              value={c}
              className="flex min-h-14 cursor-pointer flex-col justify-center rounded-[12px] border border-rule px-3.5 py-2 outline-none transition-colors data-[hovered]:border-ink-muted data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper-raised"
            >
              <span className="text-[15px] font-medium">{t.sort.closenessOptions[c].label}</span>
              <span className="text-[12px] opacity-75">{t.sort.closenessOptions[c].hint}</span>
            </Radio>
          ))}
        </div>
      </RadioGroup>

      <TagPicker label={t.sort.group} tags={tags} value={tagIds} onChange={setTagIds} onCreated={onTagCreated} />

      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>{t.sort.knows}</span>
        <p className="-mt-1 text-[13px] text-ink-muted">{t.sort.knowsHint}</p>
        {already.length > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
            {t.sort.alreadyKnows}
            {already.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 text-ink">
                <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                {p.name}
              </span>
            ))}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {chips.length > 0 && (
            <ToggleButtonGroup
              aria-label={t.sort.knows}
              selectionMode="multiple"
              selectedKeys={knows}
              onSelectionChange={(keys) => setKnows([...keys].map(String))}
              className="contents"
            >
              {chips.map((p) => (
                <ToggleButton key={p.id} id={p.id} className={`${chipBase} pl-1.5`}>
                  <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                  {p.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
          <ParticipantPicker
            persons={[...everyone, ...extra].filter((p) => p.id !== person.id)}
            selected={knows}
            onAdd={(id) => setKnows((prev) => (prev.includes(id) ? prev : [...prev, id]))}
            onCreate={async (name) => {
              const res = await settle(createPerson({ name, type: 'FRIEND' }))
              if (!res.ok) return null
              setExtra((prev) => [...prev, { id: res.data.id, name: name.trim(), tint: 'stone' }])
              return res.data.id
            }}
          />
        </div>
      </div>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] -mx-5 -mb-5 flex items-center gap-2 rounded-b-[20px] border-t border-rule bg-paper-raised/95 px-5 py-3 backdrop-blur-sm sm:-mx-7 sm:-mb-7 sm:px-7 desk:bottom-0">
        <Button variant="quiet" size="sm" onPress={onArchive} isDisabled={busy}>
          {t.sort.archive}
        </Button>
        <Button variant="quiet" size="sm" onPress={onSkip} isDisabled={busy || !canSkip}>
          {t.sort.skip}
        </Button>
        <Button variant="primary" size="lg" isDisabled={busy} onPress={() => onSubmit({ closeness, tagIds, knows })} className="ml-auto">
          {t.sort.next}
          <kbd className="hidden font-sans text-[12px] opacity-60 desk:inline">⌘↵</kbd>
        </Button>
      </div>
    </article>
  )
}

/**
 * Kortstokken: én person om gangen, som når Letterboxd tar deg inn i appen.
 * Hvor nær, hvilket miljø, hvem de kjenner, og neste. Du kan gå når som
 * helst; de usorterte venter til neste gang.
 */
export function CardDeck({ data, only }: { data: SortingData; only?: string[] }) {
  // Stokken slik den var da du begynte. Siden hentes på nytt etter hvert kort,
  // og da er den som nettopp ble sortert, borte fra dataene; Angre trenger den.
  const [deck] = useState(() => (only?.length ? data.unsorted.filter((p) => only.includes(p.id)) : data.unsorted))
  const byId = useMemo(() => new Map(deck.map((p) => [p.id, p])), [deck])
  const deckPeople = useMemo(() => deck.map((p) => ({ ...p, hasBirthday: p.birthday !== null })), [deck])

  const [queue, setQueue] = useState(() => deck.map((p) => p.id))
  const [done, setDone] = useState<Done[]>([])
  const [tags, setTags] = useState<PickerTag[]>(data.tags)
  const [sortedNow, setSortedNow] = useState<Known[]>([])
  // Forbindelsene du har lagt inn i denne runden; siden hentes på nytt, men
  // neste kort skal kjenne dem med en gang.
  const [sessionPairs, setSessionPairs] = useState<[string, string][]>([])
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()

  const total = deck.length
  // Alle vi vet noe om, med miljøene sine: det du nettopp la inn vinner.
  const people = useMemo(() => {
    const map = new Map<string, Known>()
    for (const p of [...data.unsorted, ...data.sorted, ...sortedNow]) map.set(p.id, { id: p.id, name: p.name, tint: p.tint, tagIds: p.tagIds })
    return map
  }, [data.unsorted, data.sorted, sortedNow])
  const current = queue[0] ? byId.get(queue[0]) : undefined
  // Nylig sorterte først; når siden er hentet på nytt, står de også i data.sorted.
  const known = useMemo(
    () => [...sortedNow, ...data.sorted.filter((p) => !sortedNow.some((s) => s.id === p.id))],
    [sortedNow, data.sorted],
  )
  const everyone = useMemo(
    () => [...data.sorted, ...data.unsorted.map((p) => ({ id: p.id, name: p.name, tint: p.tint, tagIds: p.tagIds }))],
    [data.sorted, data.unsorted],
  )

  const advance = (person: UnsortedPerson, archived: boolean) => {
    setDone((prev) => [...prev, { id: person.id, archived }])
    // Samme etternavn eller e-postdomene kommer rett etter: ofte familie og kolleger.
    setQueue((prev) => (archived ? prev.slice(1) : pullRelated(prev.slice(1), { ...person, hasBirthday: false }, deckPeople)))
  }

  const submit = (form: { closeness: Closeness; tagIds: string[]; knows: string[] }) => {
    if (!current) return
    const person = current
    setError('')
    startTransition(async () => {
      const res = await settle(sortPerson({ personId: person.id, ...form }))
      if (!res.ok) return setError(t.errors[res.error])
      setSortedNow((prev) => [{ id: person.id, name: person.name, tint: person.tint, tagIds: form.tagIds }, ...prev.filter((p) => p.id !== person.id)])
      setSessionPairs((prev) => [...prev, ...form.knows.map((id) => [person.id, id] as [string, string])])
      advance(person, false)
    })
  }

  const archive = () => {
    if (!current) return
    const person = current
    setError('')
    startTransition(async () => {
      const res = await settle(archivePersons([person.id]))
      if (!res.ok) return setError(t.errors[res.error])
      advance(person, true)
    })
  }

  const skip = () => setQueue((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev))

  // Angre: forrige kort kommer tilbake. Det som ble lagret, står og kan rettes;
  // en som ble tatt ut av kartet, kommer tilbake til bunken.
  const undo = () => {
    const last = done.at(-1)
    if (!last) return
    startTransition(async () => {
      if (last.archived) {
        const res = await settle(restorePerson(last.id))
        if (!res.ok) return setError(t.errors[res.error])
      }
      setDone((prev) => prev.slice(0, -1))
      setQueue((prev) => [last.id, ...prev.filter((id) => id !== last.id)])
    })
  }

  const hints = useMemo(() => {
    if (!current) return null
    const tagsOf = new Map([...people].map(([id, p]) => [id, p.tagIds]))
    const h = networkHints(current.id, [...data.pairs, ...sessionPairs], tagsOf)
    const pick = (ids: string[]) => ids.flatMap((id) => people.get(id) ?? [])
    return { already: pick(h.already), network: pick(h.suggested), tagIds: h.tagIds }
  }, [current, people, data.pairs, sessionPairs])

  const progress = total ? done.length / total : 1

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-5 sm:px-5 sm:py-8">
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={t.sort.title}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done.length}
          aria-valuetext={t.sort.progress(done.length, total)}
          className="h-1 flex-1 overflow-hidden rounded-full bg-rule"
        >
          <div className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="text-[13px] tabular-nums text-ink-muted">{t.sort.progress(done.length, total)}</span>
        {current && (
          <Button variant="quiet" size="sm" onPress={undo} isDisabled={busy || done.length === 0}>
            <Undo2 aria-hidden size={14} strokeWidth={1.75} />
            {t.sort.undo}
          </Button>
        )}
        <Link href="/sorter" className="text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          {t.sort.exit}
        </Link>
      </div>

      {current ? (
        <>
          <Card
            key={current.id}
            person={current}
            tags={tags}
            known={known}
            everyone={everyone}
            already={hints?.already ?? []}
            network={hints?.network ?? []}
            initialTags={current.tagIds.length ? current.tagIds : (hints?.tagIds ?? [])}
            onTagCreated={(tag) => setTags((prev) => [...prev, tag])}
            onSubmit={submit}
            onSkip={skip}
            onArchive={archive}
            canSkip={queue.length > 1}
            busy={busy}
          />
          {error && (
            <p role="alert" className="text-[14px] text-redpencil">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="animate-card-in flex flex-col items-center gap-4 rounded-[20px] border border-rule bg-paper-raised px-6 py-12 text-center">
          <h1 className="font-display text-[30px] leading-tight">{t.sort.doneTitle}</h1>
          <p className="max-w-sm text-[15px] text-ink-muted">{t.sort.doneBody}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/kart" className={buttonClass('primary', 'lg')}>
              {t.sort.seeMap}
            </Link>
            <Link href="/sorter/miljo" className={buttonClass('secondary', 'lg')}>
              {t.sort.ways.group.title}
            </Link>
          </div>
          {done.length > 0 && (
            <Button variant="quiet" size="sm" onPress={undo} isDisabled={busy}>
              <Undo2 aria-hidden size={14} strokeWidth={1.75} />
              {t.sort.undo}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
