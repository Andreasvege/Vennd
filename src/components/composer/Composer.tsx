'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Button as AriaButton,
  Checkbox,
  Label,
  TextArea,
  TextField as AriaTextField,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-aria-components'
import { Check, Plus, X } from 'lucide-react'
import { Avatar, Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldControl, fieldLabel } from '@/components/ui/TextField'
import { useToast } from '@/components/toast/ToastProvider'
import { findMentions } from '@/domain/mentions'
import { todayISO } from '@/domain/format'
import { createLog } from '@/server/actions/log'
import { createPerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { ComposerData, ComposerPerson } from '@/server/queries/composer'
import { t } from '@/i18n'
import type { LogEntryType } from '@/types'
import { ParticipantPicker } from './ParticipantPicker'
import type { ComposerPreset } from './ComposerProvider'
import { dueFrom, type DueChoice } from '@/domain/plans'
import { useDraft } from './useDraft'

type When = 'today' | 'yesterday' | 'other'
type NewThread = { key: number; title: string; personIds: string[]; autoFocus: boolean; due: DueChoice }

const LOG_TYPES: LogEntryType[] = ['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER']
const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'today', label: t.composer.today },
  { value: 'yesterday', label: t.composer.yesterday },
  { value: 'other', label: t.composer.otherDay },
]

function dateFor(when: When, other: string): string {
  if (when === 'other') return other
  const d = new Date()
  if (when === 'yesterday') d.setDate(d.getDate() - 1)
  return todayISO(d)
}

type Props = {
  isOpen: boolean
  onClose: () => void
  data: ComposerData
  /** Forhåndsutfylt, f.eks. fra en profil eller en plan. Uten personer gjenopprettes kladden. */
  preset?: ComposerPreset
}

/**
 * Å logge noe: skriv hva som skjedde, så foreslår arket hvem det gjaldt ut
 * fra teksten, viser trådene du kan lukke med dem, og lar deg legge igjen
 * noe å følge opp. Alt lagres i én handling.
 */
export function Composer({ isOpen, onClose, data, preset = {} }: Props) {
  const presetPersonIds = preset.personIds
  const toast = useToast()
  const draft = useDraft()
  // Kladden leses én gang, når arket åpnes uten forhåndsvalgte personer.
  const [restored] = useState(() => (presetPersonIds?.length ? null : draft.load()))
  const [showRestored, setShowRestored] = useState(Boolean(restored))

  const [extraPersons, setExtraPersons] = useState<ComposerPerson[]>([])
  const persons = useMemo(() => [...data.persons, ...extraPersons], [data.persons, extraPersons])
  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons])

  const presetWhen: When = !preset.date || preset.date === todayISO() ? 'today' : 'other'
  const [when, setWhen] = useState<When>(presetWhen)
  const [otherDate, setOtherDate] = useState(preset.date ?? todayISO())
  const [type, setType] = useState<LogEntryType | null>(preset.type ?? null)
  const [text, setText] = useState(preset.text ?? restored?.text ?? '')
  // Personer du selv har valgt (eller som var forhåndsvalgt).
  const [chosen, setChosen] = useState<string[]>(() => {
    // En kladd kan nevne noen som er slettet siden; de ville verken vises
    // eller kunne lagres.
    const exists = new Set(data.persons.map((p) => p.id))
    return (presetPersonIds?.length ? presetPersonIds : (restored?.personIds ?? [])).filter((id) => exists.has(id))
  })
  // Folk du selv har fjernet, legges ikke til igjen fra den samme teksten.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [closing, setClosing] = useState<Map<string, string>>(new Map())
  const [newThreads, setNewThreads] = useState<NewThread[]>(
    (restored?.newThreads ?? []).map((th, i) => ({ ...th, key: i, autoFocus: false, due: 'none' as DueChoice })),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mentions = useMemo(() => findMentions(text, persons), [text, persons])

  // Deltakerne er de du har valgt, pluss sikre treff fra teksten som du
  // ikke har fjernet. Tvetydige treff blir forslag lenger ned.
  const personIds = useMemo(
    () => [...new Set([...chosen, ...mentions.sure.filter((id) => !dismissed.has(id))])],
    [chosen, mentions, dismissed],
  )

  // Kladden holdes oppdatert, bortsett fra når arket åpnes fra en profil.
  useEffect(() => {
    if (presetPersonIds?.length) return
    draft.save({ text, personIds, newThreads: newThreads.map(({ title, personIds }) => ({ title, personIds })) })
  }, [text, personIds, newThreads, presetPersonIds, draft])

  const discard = () => {
    draft.clear()
    setText('')
    setChosen([])
    setDismissed(new Set())
    setNewThreads([])
    setClosing(new Map())
    setShowRestored(false)
  }

  const addPerson = (id: string) => {
    setChosen((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setDismissed((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const removePerson = (id: string) => {
    setChosen((prev) => prev.filter((p) => p !== id))
    setDismissed((prev) => new Set(prev).add(id))
  }

  const createAndAdd = async (name: string) => {
    const result = await settle(createPerson({ name, type: 'FRIEND' }))
    if (!result.ok) {
      setError(t.errors[result.error])
      return null
    }
    setExtraPersons((prev) => [...prev, { id: result.data.id, name: name.trim(), tint: 'stone' }])
    return result.data.id
  }

  const threadsWithThem = data.threads.filter((th) => th.personIds.some((id) => personIds.includes(id)))

  const toggleClosing = (id: string, on: boolean) =>
    setClosing((prev) => {
      const next = new Map(prev)
      if (on) next.set(id, '')
      else next.delete(id)
      return next
    })

  const addFollowUp = () =>
    setNewThreads((prev) => [...prev, { key: Date.now(), title: '', personIds: [...personIds], autoFocus: true, due: 'none' }])

  const submit = async () => {
    if (saving) return
    if (personIds.length === 0) {
      setError(t.composer.needPerson)
      return
    }
    setSaving(true)
    setError('')

    const lines = newThreads
      .filter((th) => th.title.trim())
      .map((th) => {
        // En linje følger deltakerne: de som er fjernet siden, faller bort, og
        // står ingen igjen, gjelder den alle.
        const who = th.personIds.filter((id) => personIds.includes(id))
        return { title: th.title, personIds: who.length ? who : personIds, dueDate: dueFrom(th.due) }
      })

    const result = await settle(
      createLog({
        personIds,
        date: dateFor(when, otherDate),
        type,
        body: text,
        // Bare tråder som faktisk vises: fjerner du personen en avkrysset
        // tråd gjaldt, skal den ikke lukkes i det skjulte.
        closeThreads: [...closing]
          .filter(([id]) => threadsWithThem.some((th) => th.id === id))
          .map(([id, resolution]) => ({ id, resolution })),
        newThreads: lines,
        planId: preset.planId,
      }),
    )
    setSaving(false)

    if (!result.ok) {
      setError(t.errors[result.error])
      return
    }
    // En logg fra en profil har ikke rørt kladden; den skal ligge der til neste gang.
    if (!presetPersonIds?.length) draft.clear()
    toast(t.composer.saved(result.data.closed, result.data.opened))
    onClose()
  }

  const maybe = mentions.maybe
    .map((m) => ({ ...m, ids: m.ids.filter((id) => !personIds.includes(id) && !dismissed.has(id)) }))
    .filter((m) => m.ids.length > 0)

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t.composer.title}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <ChipGroup label={t.composer.when} hideLabel value={when} onChange={setWhen} options={WHEN_OPTIONS} />
          {when === 'other' && (
            <TextField label={t.log.date} type="date" value={otherDate} onChange={setOtherDate} className="w-44" />
          )}
        </div>

        {showRestored && (
          <div className="-mb-2 flex items-center justify-between gap-3 text-[13px] text-ink-muted">
            <span>{t.composer.draftRestored}</span>
            <Button variant="quiet" size="sm" onPress={discard} className="-mr-2.5">
              {t.composer.discardDraft}
            </Button>
          </div>
        )}

        <AriaTextField value={text} onChange={setText} className="flex flex-col" autoFocus>
          <Label className="sr-only">{t.composer.text}</Label>
          <TextArea
            rows={4}
            placeholder={t.composer.prompt}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void submit()
              }
            }}
            className={`${fieldControl} resize-none font-display text-[19px] leading-relaxed`}
          />
        </AriaTextField>

        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>{t.composer.with}</span>
          <div className="flex flex-wrap items-center gap-2">
            {personIds.map((id) => {
              const p = byId.get(id)
              if (!p) return null
              return (
                <span
                  key={id}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink bg-ink py-1 pl-1.5 pr-1 text-[14px] text-paper desk:min-h-9"
                >
                  <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                  {p.name}
                  <AriaButton
                    aria-label={t.composer.removePerson(p.name)}
                    onPress={() => removePerson(id)}
                    className="flex size-8 items-center justify-center rounded-full opacity-80 outline-none data-[hovered]:opacity-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-paper"
                  >
                    <X aria-hidden size={14} strokeWidth={2} />
                  </AriaButton>
                </span>
              )
            })}
            <ParticipantPicker persons={persons} selected={personIds} onAdd={addPerson} onCreate={createAndAdd} />
          </div>

          {maybe.map((m) => (
            <div key={m.word} className="flex flex-wrap items-center gap-2 text-[14px]">
              <span className="text-ink-muted">{t.composer.didYouMean(m.word)}</span>
              {m.ids.map((id) => (
                <AriaButton
                  key={id}
                  onPress={() => addPerson(id)}
                  className={`${chipBase} border-dashed`}
                >
                  <Plus aria-hidden size={14} strokeWidth={1.75} />
                  {byId.get(id)?.name}
                </AriaButton>
              ))}
            </div>
          ))}
        </div>

        <ToggleButtonGroup
          aria-label={t.composer.type}
          selectionMode="single"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => setType(([...keys][0] as LogEntryType | undefined) ?? null)}
          className="flex flex-wrap gap-2"
        >
          {LOG_TYPES.map((value) => (
            <ToggleButton key={value} id={value} className={chipBase}>
              {t.logType[value]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {threadsWithThem.length > 0 && (
          <fieldset className="flex flex-col gap-2 rounded-[16px] border border-rule bg-paper-raised p-4">
            <legend className="px-1 text-[13px] text-ink-muted">{t.composer.openThreads}</legend>
            {threadsWithThem.map((th) => {
              const checked = closing.has(th.id)
              const who = th.personIds
                .map((id) => byId.get(id)?.name.split(' ')[0])
                .filter(Boolean)
                .join(', ')
              return (
                <div key={th.id} className="flex flex-col gap-2">
                  <Checkbox
                    isSelected={checked}
                    onChange={(on) => toggleClosing(th.id, on)}
                    className="group flex min-h-11 cursor-pointer items-center gap-3 text-[15px] outline-none desk:min-h-9"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink group-data-[selected]:bg-ink group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-pen group-data-[focus-visible]:ring-offset-2 group-data-[focus-visible]:ring-offset-paper-raised">
                      <Check aria-hidden size={12} strokeWidth={3} className="hidden text-paper group-data-[selected]:block" />
                    </span>
                    <span className="group-data-[selected]:text-ink-muted group-data-[selected]:line-through">
                      {th.title}
                    </span>
                    <span className="text-[13px] text-ink-muted">· {who}</span>
                  </Checkbox>
                  {checked && (
                    <TextField
                      label={t.composer.howItWent}
                      description={t.common.optional}
                      value={closing.get(th.id) ?? ''}
                      onChange={(v) => setClosing((prev) => new Map(prev).set(th.id, v))}
                      placeholder={t.composer.howItWentPlaceholder}
                      className="ml-8"
                    />
                  )}
                </div>
              )
            })}
          </fieldset>
        )}

        <div className="flex flex-col gap-3">
          {newThreads.map((line) => (
            <div key={line.key} className="flex flex-col gap-2 rounded-[16px] border border-rule p-3">
              <div className="flex items-end gap-2">
                <TextField
                  label={t.composer.followUp}
                  value={line.title}
                  onChange={(v) =>
                    setNewThreads((prev) => prev.map((l) => (l.key === line.key ? { ...l, title: v } : l)))
                  }
                  placeholder={t.composer.followUpPlaceholder}
                  className="flex-1"
                  // Bare linjer du nettopp la til: en gjenopprettet kladd skal
                  // starte i tekstfeltet, ikke i siste linje.
                  autoFocus={line.autoFocus}
                />
                <Button
                  variant="quiet"
                  aria-label={t.composer.removeFollowUp}
                  onPress={() => setNewThreads((prev) => prev.filter((l) => l.key !== line.key))}
                  size="icon"
                >
                  <X aria-hidden size={16} strokeWidth={1.75} />
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <Select
                  label={t.composer.followUpWhen}
                  value={['none', 'week', 'month'].includes(line.due) ? line.due : 'date'}
                  onChange={(v) =>
                    setNewThreads((prev) =>
                      prev.map((l) => (l.key === line.key ? { ...l, due: v === 'date' ? todayISO() : v } : l)),
                    )
                  }
                  options={[
                    { value: 'none', label: t.composer.dueNone },
                    { value: 'week', label: t.composer.dueWeek },
                    { value: 'month', label: t.composer.dueMonth },
                    { value: 'date', label: t.composer.dueDate },
                  ]}
                  className="w-44"
                />
                {!['none', 'week', 'month'].includes(line.due) && (
                  <TextField
                    label={t.log.date}
                    type="date"
                    value={line.due}
                    onChange={(v) => setNewThreads((prev) => prev.map((l) => (l.key === line.key ? { ...l, due: v } : l)))}
                    className="w-44"
                  />
                )}
              </div>
              {personIds.length > 1 && (
                <ToggleButtonGroup
                  aria-label={t.composer.followUpAbout}
                  selectionMode="multiple"
                  selectedKeys={line.personIds.filter((id) => personIds.includes(id))}
                  // Minst én: en linje uten personer ville havnet på alle i det skjulte.
                  disallowEmptySelection
                  onSelectionChange={(keys) =>
                    setNewThreads((prev) =>
                      prev.map((l) => (l.key === line.key ? { ...l, personIds: [...keys].map(String) } : l)),
                    )
                  }
                  className="flex flex-wrap gap-1.5"
                >
                  {personIds.map((id) => (
                    <ToggleButton key={id} id={id} className={chipBase}>
                      {byId.get(id)?.name.split(' ')[0]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </div>
          ))}
          <Button variant="quiet" onPress={addFollowUp} className="-ml-2 self-start">
            <Plus aria-hidden size={16} strokeWidth={1.75} />
            {t.composer.followUp}
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-rule pt-4">
          <span className="hidden text-[13px] text-ink-muted desk:inline">{t.composer.saveHint}</span>
          <Button variant="primary" size="lg" type="submit" isDisabled={saving}>
            {saving ? t.common.saving : t.composer.save}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
