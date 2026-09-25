'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ChipGroup, Select, TextField } from '@/components/ui'
import { DEFAULT_CADENCE_WEEKS } from '@/lib/cadence'
import { TYPE_TINT } from '@/lib/palette'
import { t } from '@/i18n'
import type { Person, RelationshipType } from '@/types'
import { CADENCE_OPTIONS, cadenceFromOption, cadenceToOption, type CadenceOption } from './cadence-options'

const TYPE_OPTIONS = (Object.keys(TYPE_TINT) as RelationshipType[]).map((value) => ({
  value,
  label: t.relationType[value],
  tint: TYPE_TINT[value],
}))

export function EditPersonForm({ person }: { person: Person }) {
  const router = useRouter()
  const [name, setName] = useState(person.name)
  const [notes, setNotes] = useState(person.notes ?? '')
  const [type, setType] = useState<RelationshipType>(person.type)
  const [cadence, setCadence] = useState<CadenceOption>(cadenceToOption(person.cadenceWeeks))
  // Velgeren runder kadenser som ikke finnes i lista. Sendes den bare når
  // du har endret den, blir en uvanlig kadens stående urørt.
  const [cadenceTouched, setCadenceTouched] = useState(false)
  const [birthday, setBirthday] = useState(
    person.birthday ? new Date(person.birthday).toISOString().slice(0, 10) : '',
  )
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const chooseType = (next: RelationshipType) => {
    setType(next)
    // Følg typens standard så lenge kadensen ikke er slått av.
    if (cadence !== 'never') {
      setCadence(cadenceToOption(DEFAULT_CADENCE_WEEKS[next]))
      setCadenceTouched(true)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError('')

    const res = await fetch(`/api/persons/${person.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        notes,
        type,
        ...(cadenceTouched && {
          cadenceWeeks: cadenceFromOption(cadence),
          // Endrer du kadensen, er en gammel utsettelse ikke lenger relevant.
          snoozedUntil: null,
        }),
        birthday: birthday || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError(t.person.saveFailed)
      return
    }

    router.push(`/person/${person.id}`)
    router.refresh()
  }

  const remove = async () => {
    setSaving(true)
    const res = await fetch(`/api/persons/${person.id}`, { method: 'DELETE' })
    setSaving(false)

    if (!res.ok) {
      setError(t.person.deleteFailed)
      return
    }

    router.push('/')
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <TextField label={t.person.name} isRequired value={name} onChange={setName} />
      <ChipGroup label={t.person.relationship} value={type} onChange={chooseType} options={TYPE_OPTIONS} />
      <Select
        label={t.cadence.label}
        value={cadence}
        onChange={(next) => {
          setCadence(next)
          setCadenceTouched(true)
        }}
        options={CADENCE_OPTIONS}
      />
      <TextField
        label={t.person.birthday}
        description={t.common.optional}
        type="date"
        value={birthday}
        onChange={setBirthday}
      />
      <TextField label={t.person.notes} multiline serif value={notes} onChange={setNotes} />

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-5">
        <Button variant="primary" type="submit" isDisabled={saving || !name.trim()}>
          {saving ? t.common.saving : t.common.save}
        </Button>
        <Button variant="secondary" onPress={() => router.push(`/person/${person.id}`)} isDisabled={saving}>
          {t.common.cancel}
        </Button>
        <div className="flex-1" />
        {confirmDelete ? (
          <Button variant="danger" onPress={remove} isDisabled={saving}>
            {t.person.deleteForGood}
          </Button>
        ) : (
          <Button variant="quiet" onPress={() => setConfirmDelete(true)} isDisabled={saving}>
            {t.common.delete}
          </Button>
        )}
      </div>

      {confirmDelete && (
        <p className="-mt-2 text-[13px] text-ink-muted">{t.person.deleteWarning(person.name)}</p>
      )}
    </form>
  )
}
