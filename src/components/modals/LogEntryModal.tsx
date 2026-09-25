'use client'

import { useEffect, useState } from 'react'
import { Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import { todayISO } from '@/domain/format'
import { t } from '@/i18n'
import type { LogEntryType, Person } from '@/types'

const LOG_TYPES = (['MET', 'CALLED', 'MESSAGE', 'OTHER'] as const).map((value) => ({
  value,
  label: t.logType[value],
}))

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultPersonId?: string
}

export function LogEntryModal({ isOpen, onClose, onSuccess, defaultPersonId }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [personId, setPersonId] = useState<string | null>(defaultPersonId ?? null)
  const [type, setType] = useState<LogEntryType>('MET')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Arket holdes montert mellom åpninger, så state må synkes mot props når
  // det åpnes på nytt (React-mønsteret «juster state under render»).
  const [prevKey, setPrevKey] = useState(`${isOpen}-${defaultPersonId ?? ''}`)
  const key = `${isOpen}-${defaultPersonId ?? ''}`
  if (key !== prevKey) {
    setPrevKey(key)
    if (isOpen) {
      setPersonId(defaultPersonId ?? null)
      setDate(todayISO())
      setError('')
    }
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
    if (!personId) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, type, notes, date }),
    })

    setLoading(false)

    if (!res.ok) {
      setError(t.log.failed)
      return
    }

    setNotes('')
    setType('MET')
    onSuccess()
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t.log.title}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Select
          label={t.log.person}
          value={personId}
          onChange={setPersonId}
          options={persons.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={t.common.choosePerson}
          isRequired
          // Uten valgt person er det første du må gjøre; ellers er det å skrive.
          autoFocus={!defaultPersonId}
        />
        <ChipGroup label={t.log.type} value={type} onChange={setType} options={LOG_TYPES} />
        <TextField label={t.log.date} type="date" value={date} onChange={setDate} />
        <TextField
          label={t.log.note}
          description={t.common.optional}
          multiline
          serif
          rows={4}
          autoFocus={Boolean(defaultPersonId)}
          value={notes}
          onChange={setNotes}
          placeholder={t.log.notePlaceholder}
        />

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <Button variant="primary" size="lg" type="submit" isDisabled={loading || !personId}>
          {loading ? t.common.saving : t.log.save}
        </Button>
      </form>
    </Sheet>
  )
}
