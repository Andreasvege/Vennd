'use client'

import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Button, Sheet, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { useToast } from '@/components/toast/ToastProvider'
import { deleteLog, updateLog } from '@/server/actions/log'
import { settle } from '@/server/actions/result'
import type { ComposerData } from '@/server/queries/composer'
import type { LogEntryType } from '@/types'
import { t } from '@/i18n'
import { PeopleField } from './PeopleField'

/** En lagret logg slik skjemaet trenger den. `date` er YYYY-MM-DD. */
export type LogDraft = { id: string; body: string | null; date: string; type: LogEntryType | null; personIds: string[] }

const TYPES: LogEntryType[] = ['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER']

/**
 * Rett en logg i ettertid, eller slett den. Trådene den lukket og åpnet
 * står urørt; dem styrer du fra profilen.
 */
export function LogEditSheet({ data, log, onClose }: { data: ComposerData; log: LogDraft; onClose: () => void }) {
  const toast = useToast()
  const [body, setBody] = useState(log.body ?? '')
  const [date, setDate] = useState(log.date)
  const [type, setType] = useState<LogEntryType | null>(log.type)
  const [personIds, setPersonIds] = useState(log.personIds)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (busy) return
    if (personIds.length === 0) return setError(t.plans.needPerson)
    setBusy(true)
    setError('')
    const result = await settle(updateLog(log.id, { body, date, type, personIds }))
    setBusy(false)
    if (!result.ok) return setError(t.errors[result.error])
    toast(t.log.updated)
    onClose()
  }

  const remove = async () => {
    setBusy(true)
    const result = await settle(deleteLog(log.id))
    setBusy(false)
    if (!result.ok) return setError(t.errors[result.error])
    toast(t.log.deleted)
    onClose()
  }

  return (
    <Sheet isOpen onOpenChange={(open) => !open && onClose()} title={t.log.editTitle}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
        className="flex flex-col gap-5"
      >
        <TextField label={t.composer.text} multiline serif value={body} onChange={setBody} autoFocus />
        <PeopleField label={t.plans.who} persons={data.persons} value={personIds} onChange={setPersonIds} onError={setError} />
        <TextField label={t.log.date} type="date" value={date} onChange={setDate} className="w-44" isRequired />
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
        {confirmDelete && <p className="text-[14px] text-ink-muted">{t.log.deleteWarning}</p>}

        <div className="flex items-center justify-between gap-3 border-t border-rule pt-4">
          {confirmDelete ? (
            <Button variant="danger" onPress={remove} isDisabled={busy}>
              {t.log.confirmDelete}
            </Button>
          ) : (
            <Button variant="quiet" onPress={() => setConfirmDelete(true)} isDisabled={busy}>
              {t.log.delete}
            </Button>
          )}
          <Button variant="primary" size="lg" type="submit" isDisabled={busy || !date}>
            {busy ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
