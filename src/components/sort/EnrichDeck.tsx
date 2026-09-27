'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Radio, RadioGroup, Label, ToggleButton, ToggleButtonGroup, Button as AriaButton } from 'react-aria-components'
import { Plus, X } from 'lucide-react'
import { Avatar, Button, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { buttonClass } from '@/components/ui/button-styles'
import { RelativeDay } from '@/components/RelativeDay'
import { ParticipantPicker } from '@/components/composer/ParticipantPicker'
import { useToast } from '@/components/toast/ToastProvider'
import { SEEN_CHOICES, seenDate, type Gap, type SeenChoice } from '@/domain/enrich'
import { rankKnows, type CadenceChoice } from '@/domain/sorting'
import { createPerson } from '@/server/actions/person'
import { enrichPerson } from '@/server/actions/sort'
import { settle } from '@/server/actions/result'
import type { EnrichCardPerson, EnrichData } from '@/server/queries/enrich'
import type { TagColor } from '@/lib/palette'
import { uniqueById } from '@/lib/uniqueById'
import { WhoFields, type Who } from './WhoFields'
import { TagPicker, type PickerTag } from './TagPicker'
import { t } from '@/i18n'

type Known = { id: string; name: string; tint: TagColor; tagIds: string[] }
type Fact = { key: number; label: string; value: string }

const SUGGESTIONS = 8
const PER_TICK = 4
// Én økt er en håndfull kort: 113 på en gang er en vegg, 15 er en kaffe.
const SESSION = 15

const radio =
  'flex min-h-11 cursor-pointer items-center rounded-full border border-rule px-3.5 text-[13px] outline-none transition-colors data-[hovered]:border-ink-muted data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper-raised desk:min-h-9'

const first = (name: string) => name.split(' ')[0]

function EnrichCard({
  person,
  tags,
  everyone,
  pairs,
  onTagCreated,
  onSaved,
  onSkip,
  canSkip,
}: {
  person: EnrichCardPerson
  tags: PickerTag[]
  everyone: Known[]
  pairs: [string, string][]
  onTagCreated: (tag: PickerTag) => void
  onSaved: (knows: string[]) => void
  onSkip: () => void
  canSkip: boolean
}) {
  const [showAll, setShowAll] = useState(person.gaps.length === 0)
  // «Sist sett» er et anslag; har dere logget kontakt, finnes svaret alt.
  const show = (gap: Gap) => (gap === 'seen' && person.lastContact ? false : showAll || person.gaps.includes(gap))

  const [seen, setSeen] = useState<SeenChoice | null>(null)
  const initialWho: Who = {
    type: person.type,
    relationLabel: person.relationLabel,
    phase: person.phase,
    cadenceWeeks: person.cadenceWeeks as CadenceChoice,
  }
  const [who, setWho] = useState<Who>(initialWho)
  const [whoTouched, setWhoTouched] = useState(false)
  const [tagIds, setTagIds] = useState<string[]>(person.tagIds)
  const [knows, setKnows] = useState<string[]>([])
  const [extra, setExtra] = useState<Known[]>([])
  const [more, setMore] = useState(0)
  const [birthday, setBirthday] = useState('')
  const [facts, setFacts] = useState<Fact[]>([])
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()

  // Hvem hun kjenner fra før, og forslag som vokser med kryssene.
  const already = useMemo(() => {
    const ids = new Set(pairs.flatMap(([a, b]) => (a === person.id ? [b] : b === person.id ? [a] : [])))
    return everyone.filter((p) => ids.has(p.id))
  }, [pairs, person.id, everyone])
  const pool = useMemo(() => uniqueById([...everyone, ...extra]), [everyone, extra])
  const byId = useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool])
  const ranked = useMemo(
    () =>
      rankKnows(person.id, [...already.map((a) => a.id), ...knows], pairs, tagIds, pool).filter(
        (id) => !knows.includes(id) && !already.some((a) => a.id === id),
      ),
    [person.id, already, knows, pairs, tagIds, pool],
  )
  const room = SUGGESTIONS + PER_TICK * knows.length + more
  const chips = [...knows, ...ranked.slice(0, room)].flatMap((id) => byId.get(id) ?? [])
  const hiddenCount = Math.max(0, ranked.length - room)

  const tagsChanged = tagIds.length !== person.tagIds.length || tagIds.some((id) => !person.tagIds.includes(id))
  const cleanFacts = facts.filter((f) => f.label.trim() && f.value.trim())

  const save = () => {
    setError('')
    startTransition(async () => {
      const res = await settle(
        enrichPerson({
          personId: person.id,
          who: whoTouched ? who : null,
          tagIds: tagsChanged ? tagIds : null,
          knows,
          birthday: birthday || null,
          facts: cleanFacts.map((f) => ({ label: f.label.trim(), value: f.value.trim() })),
          seen: seen ? { choice: seen, on: seenDate(seen, localToday()) } : null,
        }),
      )
      if (!res.ok) return setError(t.errors[res.error])
      onSaved(knows)
    })
  }

  // ⌘↵ / Ctrl+↵: lagre og neste, hvor som helst i kortet, men ikke mens en
  // liste er åpen (da hører tastetrykket til den, f.eks. et nytt navn).
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey) || busy) return
      if (document.querySelector('[role="listbox"], [role="dialog"]')) return
      e.preventDefault()
      saveRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy])

  const known = [
    person.relationLabel || t.relationType[person.type],
    person.primaryTag?.name,
    person.relationshipCount > 0 && t.enrich.connections(person.relationshipCount),
  ].filter(Boolean)

  const addFact = (label: string) => setFacts((prev) => [...prev, { key: Date.now() + prev.length, label, value: '' }])

  return (
    <article
      aria-labelledby={`enrich-${person.id}`}
      className="animate-card-in flex flex-col gap-6 rounded-[20px] border border-rule bg-paper-raised p-5 shadow-float sm:p-7"
    >
      <header className="flex items-center gap-4">
        <Avatar name={person.name} tint={person.tint} src={person.photoUrl} size="xl" decorative />
        <div className="min-w-0 flex-1">
          <h1 id={`enrich-${person.id}`} className="font-display text-[30px] leading-[1.05] tracking-tight text-balance sm:text-[36px]">
            <Link href={`/person/${person.id}`} className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pen">
              {person.name}
            </Link>
          </h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            {known.join(' · ')}
            {known.length > 0 && ' · '}
            {person.lastContact ? (
              <>
                {t.enrich.lastSeenPrefix} <RelativeDay date={person.lastContact} />
              </>
            ) : (
              t.enrich.neverSeen
            )}
          </p>
        </div>
      </header>

      {person.facts.length > 0 && (
        <ul className="-mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          {person.facts.map((f, i) => (
            <li key={i}>
              <span className="text-ink-muted">{f.label}:</span> {f.value}
            </li>
          ))}
        </ul>
      )}

      {show('seen') && (
        <RadioGroup
          value={seen}
          onChange={(v) => setSeen(v as SeenChoice)}
          orientation="horizontal"
          className="flex flex-col gap-2"
        >
          <Label className={fieldLabel}>{t.enrich.seen}</Label>
          <p className="-mt-1 text-[13px] text-ink-muted">{t.enrich.seenHint}</p>
          <div className="flex flex-wrap gap-2">
            {SEEN_CHOICES.map((c) => (
              <Radio key={c} value={c} className={radio}>
                {t.enrich.seenChoice[c]}
              </Radio>
            ))}
          </div>
        </RadioGroup>
      )}

      {show('who') && (
        <WhoFields
          value={who}
          onChange={(next) => {
            setWho(next)
            setWhoTouched(true)
          }}
        />
      )}

      {show('group') && (
        <TagPicker label={t.sort.group} tags={tags} value={tagIds} onChange={setTagIds} onCreated={onTagCreated} />
      )}

      {show('knows') && (
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>{t.sort.knows}</span>
          {already.length > 0 ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
              {t.sort.alreadyKnows}
              {already.slice(0, 12).map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1.5 text-ink">
                  <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                  {p.name}
                </span>
              ))}
              {already.length > 12 && <span>{t.enrich.andMore(already.length - 12)}</span>}
            </p>
          ) : (
            <p className="-mt-1 text-[13px] text-ink-muted">{t.sort.knowsHint}</p>
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
            {hiddenCount > 0 && (
              <Button variant="quiet" size="sm" onPress={() => setMore((m) => m + SUGGESTIONS)}>
                {t.sort.showMore(hiddenCount)}
              </Button>
            )}
            <ParticipantPicker
              persons={pool.filter((p) => p.id !== person.id && !already.some((a) => a.id === p.id))}
              selected={knows}
              onAdd={(id) => setKnows((prev) => (prev.includes(id) ? prev : [...prev, id]))}
              onCreate={async (name) => {
                const res = await settle(createPerson({ name, type: 'FRIEND' }))
                if (!res.ok) return null
                setExtra((prev) => [...prev, { id: res.data.id, name: name.trim(), tint: 'stone', tagIds: [] }])
                return res.data.id
              }}
            />
          </div>
        </div>
      )}

      {show('birthday') && (
        <TextField
          label={t.enrich.birthday}
          description={t.common.optional}
          type="date"
          value={birthday}
          onChange={setBirthday}
          className="max-w-56"
        />
      )}

      {show('facts') && (
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>{t.enrich.facts}</span>
          <p className="-mt-1 text-[13px] text-ink-muted">{t.enrich.factsHint}</p>
          {facts.map((f) => (
            <div key={f.key} className="flex items-end gap-2">
              {t.enrich.factPresets.includes(f.label) ? (
                <TextField
                  label={f.label}
                  value={f.value}
                  onChange={(value) => setFacts((prev) => prev.map((x) => (x.key === f.key ? { ...x, value } : x)))}
                  autoFocus
                  className="flex-1"
                />
              ) : (
                <>
                  <TextField
                    label={t.enrich.factLabel}
                    value={f.label}
                    onChange={(label) => setFacts((prev) => prev.map((x) => (x.key === f.key ? { ...x, label } : x)))}
                    autoFocus
                    className="w-32"
                  />
                  <TextField
                    label={t.enrich.factValueLabel}
                    value={f.value}
                    onChange={(value) => setFacts((prev) => prev.map((x) => (x.key === f.key ? { ...x, value } : x)))}
                    className="flex-1"
                  />
                </>
              )}
              <AriaButton
                aria-label={t.enrich.removeFact(f.label || t.enrich.factOther)}
                onPress={() => setFacts((prev) => prev.filter((x) => x.key !== f.key))}
                className="mb-1 flex size-10 items-center justify-center rounded-full text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
              >
                <X aria-hidden size={16} strokeWidth={1.75} />
              </AriaButton>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {t.enrich.factPresets
              .filter((label) => !facts.some((f) => f.label === label) && !person.facts.some((f) => f.label === label))
              .map((label) => (
                <AriaButton key={label} onPress={() => addFact(label)} className={chipBase}>
                  <Plus aria-hidden size={13} strokeWidth={2} />
                  {label}
                </AriaButton>
              ))}
            <AriaButton onPress={() => addFact('')} className={chipBase}>
              <Plus aria-hidden size={13} strokeWidth={2} />
              {t.enrich.factOther}
            </AriaButton>
          </div>
        </div>
      )}

      {!showAll && (
        <Button variant="quiet" size="sm" onPress={() => setShowAll(true)} className="self-start">
          {t.enrich.showAll}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] -mx-5 -mb-5 flex items-center gap-2 rounded-b-[20px] border-t border-rule bg-paper-raised/95 px-5 py-3 backdrop-blur-sm sm:-mx-7 sm:-mb-7 sm:px-7 desk:bottom-0">
        <Button variant="quiet" size="sm" onPress={onSkip} isDisabled={busy || !canSkip}>
          {t.enrich.skip}
        </Button>
        <Button variant="primary" size="lg" isDisabled={busy} onPress={save} className="ml-auto">
          {t.enrich.next}
          <kbd className="hidden font-sans text-[12px] opacity-60 desk:inline">⌘↵</kbd>
        </Button>
      </div>
    </article>
  )
}

// Leserens dag, ikke serverens: et anslag «siste uka» regnes fra i dag her.
function localToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))
}

/**
 * «Fyll inn kartet»: én og én av dem som allerede står på kartet, med bare
 * spørsmålene om det som mangler. De nærmeste først. Du kan gå når som
 * helst; det som gjenstår, venter til neste gang.
 */
export function EnrichDeck({ data, title }: { data: EnrichData; title?: string }) {
  const toast = useToast()
  const [deck] = useState(data.deck)
  const byId = useMemo(() => new Map(deck.map((p) => [p.id, p])), [deck])
  const [queue, setQueue] = useState(() => deck.slice(0, SESSION).map((p) => p.id))
  // Hvor langt ut i stokken denne økten rekker; «15 til» flytter grensen.
  const [reach, setReach] = useState(Math.min(SESSION, deck.length))
  const [done, setDone] = useState(0)
  const [tags, setTags] = useState<PickerTag[]>(data.tags)
  const [sessionPairs, setSessionPairs] = useState<[string, string][]>([])
  const pairs = useMemo(() => [...data.pairs, ...sessionPairs], [data.pairs, sessionPairs])
  const current = queue[0] ? byId.get(queue[0]) : undefined
  const total = reach
  const remaining = deck.length - reach
  const nextSession = () => {
    const next = deck.slice(reach, reach + SESSION).map((p) => p.id)
    setQueue(next)
    setReach((r) => r + next.length)
  }

  const saved = (person: EnrichCardPerson, knows: string[]) => {
    setSessionPairs((prev) => [...prev, ...knows.map((id) => [person.id, id] as [string, string])])
    setDone((n) => n + 1)
    setQueue((prev) => prev.slice(1))
    toast(t.enrich.saved(first(person.name)))
  }
  const skip = () => setQueue((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev))

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-5 sm:px-5 sm:py-8">
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={title ?? t.enrich.title}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={t.sort.progress(done, total)}
          className="h-1 flex-1 overflow-hidden rounded-full bg-rule"
        >
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out"
            style={{ width: `${total ? (done / total) * 100 : 100}%` }}
          />
        </div>
        <span className="text-[13px] tabular-nums text-ink-muted">{t.sort.progress(done, total)}</span>
        <Link href="/sorter" className="text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          {t.sort.exit}
        </Link>
      </div>

      {current ? (
        <EnrichCard
          key={current.id}
          person={current}
          tags={tags}
          everyone={data.everyone}
          pairs={pairs}
          onTagCreated={(tag) => setTags((prev) => [...prev, tag])}
          onSaved={(knows) => saved(current, knows)}
          onSkip={skip}
          canSkip={queue.length > 1}
        />
      ) : (
        <div className="animate-card-in flex flex-col items-center gap-4 rounded-[20px] border border-rule bg-paper-raised px-6 py-12 text-center">
          <h1 className="font-display text-[30px] leading-tight">{total ? t.enrich.doneTitle : t.enrich.emptyTitle}</h1>
          <p className="max-w-sm text-[15px] text-ink-muted">
            {total ? (remaining > 0 ? t.enrich.sessionDone(remaining) : t.enrich.doneBody) : t.enrich.emptyBody}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {remaining > 0 && (
              <Button variant="primary" size="lg" onPress={nextSession}>
                {t.enrich.more(Math.min(SESSION, remaining))}
              </Button>
            )}
            <Link href="/kart" className={buttonClass(remaining > 0 ? 'secondary' : 'primary', 'lg')}>
              {t.sort.seeMap}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
