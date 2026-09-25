'use client'

import { settle } from '@/server/actions/result'
import { useState } from 'react'
import { Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import {
  CADENCE_OPTIONS,
  cadenceFromOption,
  cadenceToOption,
  type CadenceOption,
} from '@/components/person/cadence-options'
import { TagField, type TagOption } from '@/components/person/TagField'
import { createTagOption } from '@/components/person/tag-actions'
import { TYPE_OPTIONS } from '@/components/person/type-options'
import { DEFAULT_CADENCE_WEEKS } from '@/domain/cadence'
import { createPerson } from '@/server/actions/person'
import { t } from '@/i18n'
import type { RelationshipType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  tags: TagOption[]
}

export function AddPersonModal({ isOpen, onClose, tags }: Props) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState<RelationshipType>('FRIEND')
  // Følger typens standard til brukeren selv rører feltet.
  const [cadence, setCadence] = useState<CadenceOption>(cadenceToOption(DEFAULT_CADENCE_WEEKS.FRIEND))
  const [cadenceTouched, setCadenceTouched] = useState(false)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [primaryTagId, setPrimaryTagId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const chooseType = (next: RelationshipType) => {
    setType(next)
    if (!cadenceTouched) setCadence(cadenceToOption(DEFAULT_CADENCE_WEEKS[next]))
  }

  const reset = () => {
    setName('')
    setNotes('')
    setType('FRIEND')
    setCadence(cadenceToOption(DEFAULT_CADENCE_WEEKS.FRIEND))
    setCadenceTouched(false)
    setTagIds([])
    setPrimaryTagId(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError('')
    const result = await settle(createPerson({
      name,
      notes,
      type,
      cadenceWeeks: cadenceFromOption(cadence),
      tagIds,
      primaryTagId,
    }))
    setSaving(false)

    if (!result.ok) {
      setError(t.errors[result.error])
      return
    }
    reset()
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
        <TagField
          allTags={tags}
          value={tagIds}
          primaryTagId={primaryTagId}
          onChange={(ids, primary) => {
            setTagIds(ids)
            setPrimaryTagId(primary)
          }}
          onCreate={createTagOption}
        />
        <div className="flex flex-col gap-1.5">
          <Select
            label={t.cadence.label}
            value={cadence}
            onChange={(next) => {
              setCadenceTouched(true)
              setCadence(next)
            }}
            options={CADENCE_OPTIONS}
          />
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

        <Button variant="primary" size="lg" type="submit" isDisabled={saving || !name.trim()}>
          {saving ? t.person.adding : t.person.add}
        </Button>
      </form>
    </Sheet>
  )
}
