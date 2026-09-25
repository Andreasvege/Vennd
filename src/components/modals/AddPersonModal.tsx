'use client'

import { useState } from 'react'
import { Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import {
  CADENCE_OPTIONS,
  cadenceFromOption,
  cadenceToOption,
  type CadenceOption,
} from '@/components/person/cadence-options'
import { DEFAULT_CADENCE_WEEKS } from '@/lib/cadence'
import { TYPE_TINT } from '@/lib/palette'
import { t } from '@/i18n'
import type { RelationshipType } from '@/types'

const TYPE_OPTIONS = (Object.keys(TYPE_TINT) as RelationshipType[]).map((value) => ({
  value,
  label: t.relationType[value],
  tint: TYPE_TINT[value],
}))

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPersonModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState<RelationshipType>('FRIEND')
  // Følger typens standard til brukeren selv rører feltet.
  const [cadence, setCadence] = useState<CadenceOption>(cadenceToOption(DEFAULT_CADENCE_WEEKS.FRIEND))
  const [cadenceTouched, setCadenceTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const chooseType = (next: RelationshipType) => {
    setType(next)
    if (!cadenceTouched) setCadence(cadenceToOption(DEFAULT_CADENCE_WEEKS[next]))
  }

  const chooseCadence = (next: CadenceOption) => {
    setCadenceTouched(true)
    setCadence(next)
  }

  const reset = () => {
    setName('')
    setNotes('')
    setType('FRIEND')
    setCadence(cadenceToOption(DEFAULT_CADENCE_WEEKS.FRIEND))
    setCadenceTouched(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        notes,
        type,
        cadenceWeeks: cadenceFromOption(cadence),
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setError(t.person.addFailed)
      return
    }

    reset()
    onSuccess()
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t.person.addTitle}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label={t.person.name}
          isRequired
          value={name}
          onChange={setName}
          placeholder={t.person.namePlaceholder}
          autoFocus
        />
        <ChipGroup label={t.person.relationship} value={type} onChange={chooseType} options={TYPE_OPTIONS} />
        <div className="flex flex-col gap-1.5">
          <Select label={t.cadence.label} value={cadence} onChange={chooseCadence} options={CADENCE_OPTIONS} />
          <p className="text-[13px] text-ink-muted">{t.cadence.hint}</p>
        </div>
        <TextField
          label={t.person.notes}
          description={t.common.optional}
          multiline
          serif
          value={notes}
          onChange={setNotes}
          placeholder={t.person.notesPlaceholder}
        />

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <Button variant="primary" size="lg" type="submit" isDisabled={loading || !name.trim()}>
          {loading ? t.person.adding : t.person.add}
        </Button>
      </form>
    </Sheet>
  )
}
