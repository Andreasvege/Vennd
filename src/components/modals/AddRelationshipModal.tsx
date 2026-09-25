'use client'

import { useEffect, useState } from 'react'
import { Button, ChipGroup, Select, Sheet } from '@/components/ui'
import { TYPE_TINT } from '@/lib/palette'
import { t } from '@/i18n'
import type { Person, RelationshipType } from '@/types'

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

export function AddRelationshipModal({ isOpen, onClose, onSuccess }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [fromId, setFromId] = useState<string | null>(null)
  const [toId, setToId] = useState<string | null>(null)
  const [type, setType] = useState<RelationshipType>('FRIEND')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // En gammel feilmelding hører ikke hjemme i et nyåpnet ark.
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setError('')
  }

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/persons')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setPersons)
      .catch(() => setError(t.log.loadPersonsFailed))
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId || fromId === toId) {
      setError(t.relationship.samePerson)
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPersonId: fromId, toPersonId: toId, type }),
    })

    setLoading(false)

    if (!res.ok) {
      setError(t.relationship.failed)
      return
    }

    setFromId(null)
    setToId(null)
    setType('FRIEND')
    onSuccess()
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

        <Button variant="primary" size="lg" type="submit" isDisabled={loading || !fromId || !toId}>
          {loading ? t.common.saving : t.relationship.add}
        </Button>
      </form>
    </Sheet>
  )
}
