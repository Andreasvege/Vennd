'use client'

import { settle } from '@/server/actions/result'
import { useState } from 'react'
import { Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import { todayISO } from '@/domain/format'
import { createLog } from '@/server/actions/log'
import { t } from '@/i18n'
import type { LogEntryType } from '@/types'

export const LOG_TYPE_OPTIONS = (['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER'] as const).map((value) => ({
  value,
  label: t.logType[value],
}))

type Props = {
  isOpen: boolean
  onClose: () => void
  persons: { id: string; name: string }[]
  defaultPersonId?: string
}

export function LogEntryModal({ isOpen, onClose, persons, defaultPersonId }: Props) {
  const [personId, setPersonId] = useState<string | null>(defaultPersonId ?? null)
  const [type, setType] = useState<LogEntryType>('MET')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Arket holdes montert mellom åpninger, så state må synkes mot props når
  // det åpnes på nytt (React-mønsteret «juster state under render»).
  const key = `${isOpen}-${defaultPersonId ?? ''}`
  const [prevKey, setPrevKey] = useState(key)
  if (key !== prevKey) {
    setPrevKey(key)
    if (isOpen) {
      setPersonId(defaultPersonId ?? null)
      setDate(todayISO())
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personId) return

    setSaving(true)
    setError('')
    const result = await settle(createLog({ personIds: [personId], type, body: notes, date }))
    setSaving(false)

    if (!result.ok) {
      setError(t.errors[result.error])
      return
    }
    setNotes('')
    setType('MET')
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
        <ChipGroup label={t.log.type} value={type} onChange={setType} options={LOG_TYPE_OPTIONS} />
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

        <Button variant="primary" size="lg" type="submit" isDisabled={saving || !personId}>
          {saving ? t.common.saving : t.log.save}
        </Button>
      </form>
    </Sheet>
  )
}
