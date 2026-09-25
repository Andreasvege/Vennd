'use client'

import { useMemo, useState } from 'react'
import { Button as AriaButton, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { X } from 'lucide-react'
import { Avatar, Button, ChipGroup, Sheet, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { useToast } from '@/components/toast/ToastProvider'
import { todayISO } from '@/domain/format'
import { createPlan } from '@/server/actions/plan'
import { createPerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { ComposerData, ComposerPerson } from '@/server/queries/composer'
import type { LogEntryType } from '@/types'
import { t } from '@/i18n'
import { ParticipantPicker } from './ParticipantPicker'

type When = 'today' | 'tomorrow' | 'other'
const TYPES: LogEntryType[] = ['MET', 'CALLED', 'DATE', 'OTHER']

function dateFor(when: When, other: string): string {
  if (when === 'other') return other
  const d = new Date()
  if (when === 'tomorrow') d.setDate(d.getDate() + 1)
  return todayISO(d)
}

/** Planlegg noe: hvem, hva og når. Klokkeslett regnes om i nettleseren. */
export function PlanSheet({ data, personIds: preset = [], onClose }: { data: ComposerData; personIds?: string[]; onClose: () => void }) {
  const toast = useToast()
  const [extra, setExtra] = useState<ComposerPerson[]>([])
  const persons = useMemo(() => [...data.persons, ...extra], [data.persons, extra])
  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons])

  const [title, setTitle] = useState('')
  const [personIds, setPersonIds] = useState<string[]>(preset)
  const [when, setWhen] = useState<When>('tomorrow')
  const [other, setOther] = useState(todayISO())
  const [time, setTime] = useState('')
  const [type, setType] = useState<LogEntryType | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (saving) return
    if (personIds.length === 0) return setError(t.plans.needPerson)
    setSaving(true)
    setError('')
    const date = dateFor(when, other)
    const result = await settle(
      createPlan({
        title,
        personIds,
        date,
        // Klokkeslett i din tidssone, gjort om til et tidspunkt her.
        at: time ? new Date(`${date}T${time}`).toISOString() : null,
        type,
      }),
    )
    setSaving(false)
    if (!result.ok) return setError(t.errors[result.error])
    toast(t.plans.saved)
    onClose()
  }

  return (
    <Sheet isOpen onOpenChange={(open) => !open && onClose()} title={t.plans.title}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        className="flex flex-col gap-5"
      >
        <TextField label={t.plans.what} value={title} onChange={setTitle} placeholder={t.plans.whatPlaceholder} autoFocus isRequired />

        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>{t.plans.who}</span>
          <div className="flex flex-wrap items-center gap-2">
            {personIds.map((id) => {
              const p = byId.get(id)
              if (!p) return null
              return (
                <span key={id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink py-1 pl-1.5 pr-1 text-[14px] text-paper desk:min-h-9">
                  <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                  {p.name}
                  <AriaButton
                    aria-label={t.composer.removePerson(p.name)}
                    onPress={() => setPersonIds((prev) => prev.filter((x) => x !== id))}
                    className="flex size-8 items-center justify-center rounded-full opacity-80 outline-none data-[hovered]:opacity-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-paper"
                  >
                    <X aria-hidden size={14} strokeWidth={2} />
                  </AriaButton>
                </span>
              )
            })}
            <ParticipantPicker
              persons={persons}
              selected={personIds}
              onAdd={(id) => setPersonIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
              onCreate={async (name) => {
                const result = await settle(createPerson({ name, type: 'FRIEND' }))
                if (!result.ok) {
                  setError(t.errors[result.error])
                  return null
                }
                setExtra((prev) => [...prev, { id: result.data.id, name: name.trim(), tint: 'stone' }])
                return result.data.id
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <ChipGroup
            label={t.plans.when}
            value={when}
            onChange={setWhen}
            options={[
              { value: 'today', label: t.plans.today },
              { value: 'tomorrow', label: t.plans.tomorrow },
              { value: 'other', label: t.plans.otherDay },
            ]}
          />
          {when === 'other' && <TextField label={t.log.date} type="date" value={other} onChange={setOther} className="w-44" />}
          <TextField label={t.plans.time} description={t.plans.timeHint} type="time" value={time} onChange={setTime} className="w-32" />
        </div>

        <ToggleButtonGroup
          aria-label={t.composer.type}
          selectionMode="single"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => setType(([...keys][0] as LogEntryType | undefined) ?? null)}
          className="flex flex-wrap gap-2"
        >
          {TYPES.map((value) => (
            <ToggleButton key={value} id={value} className={chipBase}>
              {t.logType[value]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <div className="flex justify-end border-t border-rule pt-4">
          <Button variant="primary" size="lg" type="submit" isDisabled={saving || !title.trim()}>
            {saving ? t.common.saving : t.plans.save}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
