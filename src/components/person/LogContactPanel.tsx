'use client'

import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button, ChipGroup, SectionHeading, TextField } from '@/components/ui'
import { LOG_TYPE_OPTIONS } from '@/components/modals/LogEntryModal'
import { todayISO } from '@/domain/format'
import { createLog } from '@/server/actions/log'
import { t } from '@/i18n'
import type { LogEntryType } from '@/types'

export function LogContactPanel({ personId, personName }: { personId: string; personName: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<LogEntryType>('MET')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const result = await createLog({ personIds: [personId], type, body: notes, date }).catch(() => ({
      ok: false as const,
      error: 'failed' as const,
    }))
    setSaving(false)

    if (!result.ok) {
      setError(t.errors[result.error])
      return
    }

    setNotes('')
    setType('MET')
    setDate(todayISO())
    // Handlingen frisker opp siden: loggen dukker opp, og en påminnelse
    // om personen kan forsvinne.
    setOpen(false)
  }

  return (
    <>
      <SectionHeading
        action={
          !open && (
            <Button variant="secondary" onPress={() => setOpen(true)}>
              <PenLine aria-hidden size={15} strokeWidth={1.75} />
              {t.log.action}
            </Button>
          )
        }
      >
        {t.person.log}
      </SectionHeading>

      {open && (
        <form
          onSubmit={submit}
          className="mb-6 flex flex-col gap-4 rounded-[16px] border border-rule bg-paper-raised p-4"
        >
          <ChipGroup label={t.log.what(personName)} value={type} onChange={setType} options={LOG_TYPE_OPTIONS} />
          <TextField label={t.log.date} type="date" value={date} onChange={setDate} />
          <TextField
            label={t.log.note}
            description={t.common.optional}
            multiline
            serif
            rows={3}
            value={notes}
            onChange={setNotes}
            placeholder={t.log.notePlaceholder}
          />
          {error && (
            <p role="alert" className="text-[14px] text-redpencil">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="primary" type="submit" isDisabled={saving} className="flex-1">
              {saving ? t.common.saving : t.log.save}
            </Button>
            <Button variant="quiet" onPress={() => setOpen(false)} isDisabled={saving}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      )}
    </>
  )
}
