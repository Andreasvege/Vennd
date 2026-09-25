'use client'

import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Button, ChipGroup, Sheet, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { useToast } from '@/components/toast/ToastProvider'
import { todayISO } from '@/domain/format'
import { createPlan, updatePlan } from '@/server/actions/plan'
import { settle } from '@/server/actions/result'
import type { ComposerData } from '@/server/queries/composer'
import type { LogEntryType } from '@/types'
import { t } from '@/i18n'
import { PeopleField } from './PeopleField'

type When = 'today' | 'tomorrow' | 'other'
const TYPES: LogEntryType[] = ['MET', 'CALLED', 'DATE', 'OTHER']

function dateFor(when: When, other: string): string {
  if (when === 'other') return other
  const d = new Date()
  if (when === 'tomorrow') d.setDate(d.getDate() + 1)
  return todayISO(d)
}

/** En plan som endres: det arket skal starte med. */
export type PlanDraft = { id: string; title: string; personIds: string[]; at: string; hasTime: boolean; type: LogEntryType | null }

// Fra en lagret plan til skjemaets felter, i din tidssone.
function fromPlan(plan: PlanDraft) {
  const at = new Date(plan.at)
  const date = plan.hasTime ? todayISO(at) : plan.at.slice(0, 10)
  const when: When = date === dateFor('today', '') ? 'today' : date === dateFor('tomorrow', '') ? 'tomorrow' : 'other'
  const time = plan.hasTime ? at.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }) : ''
  return { date, when, time }
}

type Props = { data: ComposerData; personIds?: string[]; plan?: PlanDraft; onClose: () => void }

/** Planlegg noe, eller endre en plan: hvem, hva og når. Klokkeslett regnes om i nettleseren. */
export function PlanSheet({ data, personIds: preset = [], plan, onClose }: Props) {
  const toast = useToast()
  const start = plan ? fromPlan(plan) : null

  const [title, setTitle] = useState(plan?.title ?? '')
  const [personIds, setPersonIds] = useState<string[]>(plan?.personIds ?? preset)
  const [when, setWhen] = useState<When>(start?.when ?? 'tomorrow')
  const [other, setOther] = useState(start?.date ?? todayISO())
  const [time, setTime] = useState(start?.time ?? '')
  const [type, setType] = useState<LogEntryType | null>(plan?.type ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (saving) return
    if (personIds.length === 0) return setError(t.plans.needPerson)
    setSaving(true)
    setError('')
    const date = dateFor(when, other)
    const input = {
      title,
      personIds,
      date,
      // Klokkeslett i din tidssone, gjort om til et tidspunkt her.
      at: time ? new Date(`${date}T${time}`).toISOString() : null,
      type,
    }
    const result = await settle(plan ? updatePlan(plan.id, input) : createPlan(input))
    setSaving(false)
    if (!result.ok) return setError(t.errors[result.error])
    toast(plan ? t.plans.updated : t.plans.saved)
    onClose()
  }

  return (
    <Sheet isOpen onOpenChange={(open) => !open && onClose()} title={plan ? t.plans.editTitle : t.plans.title}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        className="flex flex-col gap-5"
      >
        <TextField label={t.plans.what} value={title} onChange={setTitle} placeholder={t.plans.whatPlaceholder} autoFocus isRequired />

        <PeopleField label={t.plans.who} persons={data.persons} value={personIds} onChange={setPersonIds} onError={setError} />

        <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
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
            {saving ? t.common.saving : plan ? t.common.save : t.plans.save}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
