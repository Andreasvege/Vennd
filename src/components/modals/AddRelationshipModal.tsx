'use client'

import { settle } from '@/server/actions/result'
import { useState } from 'react'
import { Button, ChipGroup, Select, Sheet } from '@/components/ui'
import { TYPE_OPTIONS } from '@/components/person/type-options'
import { createRelationship } from '@/server/actions/relationship'
import { useProximityNotice } from '@/components/toast/useProximityNotice'
import { t } from '@/i18n'
import type { RelationshipType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  persons: { id: string; name: string }[]
  /** Forhåndsvalgt, f.eks. fra en «ofte sammen»-kant på kartet. */
  defaultFrom?: string
  defaultTo?: string
}

export function AddRelationshipModal({ isOpen, onClose, persons, defaultFrom, defaultTo }: Props) {
  const [fromId, setFromId] = useState<string | null>(defaultFrom ?? null)
  const [toId, setToId] = useState<string | null>(defaultTo ?? null)
  const [type, setType] = useState<RelationshipType>('FRIEND')
  const [saving, setSaving] = useState(false)
  const notice = useProximityNotice()
  const [error, setError] = useState('')

  // En gammel feilmelding hører ikke hjemme i et nyåpnet ark.
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId || fromId === toId) {
      setError(t.relationship.samePerson)
      return
    }

    setSaving(true)
    setError('')
    const result = await settle(createRelationship({ fromPersonId: fromId, toPersonId: toId, type }))
    setSaving(false)

    if (!result.ok) {
      setError(t.errors[result.error])
      return
    }
    notice(result.data.proximities)
    setFromId(null)
    setToId(null)
    setType('FRIEND')
    onClose()
  }

  const options = persons.map((p) => ({ value: p.id, label: p.name }))

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t.relationship.title}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label={t.relationship.from}
            value={fromId}
            onChange={setFromId}
            options={options}
            placeholder={t.common.choosePerson}
            autoFocus
          />
          <Select
            label={t.relationship.to}
            value={toId}
            onChange={setToId}
            options={options.filter((o) => o.value !== fromId)}
            placeholder={t.common.choosePerson}
          />
        </div>
        <ChipGroup label={t.relationship.type} value={type} onChange={setType} options={TYPE_OPTIONS} />

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <Button variant="primary" size="lg" type="submit" isDisabled={saving || !fromId || !toId}>
          {saving ? t.common.saving : t.relationship.add}
        </Button>
      </form>
    </Sheet>
  )
}
