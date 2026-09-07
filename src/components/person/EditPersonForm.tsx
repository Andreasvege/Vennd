'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Radio, RadioGroup, Label } from 'react-aria-components'
import { TextField, Button } from '@/components/ui'
import { RELATIONSHIP_COLORS, RELATIONSHIP_LABELS } from '@/lib/relationship-colors'
import { DEFAULT_CADENCE_WEEKS } from '@/lib/cadence'
import type { Person, RelationshipType } from '@/types'

const COLOR_OPTIONS = [
  '#6c63ff', '#ef5350', '#29b6f6', '#ff6584',
  '#66bb6a', '#ffa726', '#ab47bc', '#26c6da',
]

const TYPES = Object.keys(RELATIONSHIP_COLORS) as RelationshipType[]
const CADENCE_CHOICES = [1, 2, 3, 4, 6, 8, 12, 26, 52] as const

type Props = {
  person: Person
}

export function EditPersonForm({ person }: Props) {
  const router = useRouter()
  const [name, setName] = useState(person.name)
  const [color, setColor] = useState(person.color)
  const [notes, setNotes] = useState(person.notes ?? '')
  const [type, setType] = useState<RelationshipType>(person.type)
  const [cadence, setCadence] = useState<number | null>(person.cadenceWeeks)
  const [birthday, setBirthday] = useState(
    person.birthday ? new Date(person.birthday).toISOString().slice(0, 10) : ''
  )
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

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
        color,
        notes,
        type,
        cadenceWeeks: cadence,
        birthday: birthday || null,
        // Endrer du kadensen, er en gammel utsettelse ikke lenger relevant.
        snoozedUntil: null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('Klarte ikke lagre. Prøv igjen.')
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
      setError('Klarte ikke slette.')
      return
    }

    router.push('/')
  }

  return (
    <form onSubmit={save} className="glass-card p-6 flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <TextField label="Navn" isRequired value={name} onChange={setName} />

        <RadioGroup
          value={type}
          onChange={(v) => {
            const next = v as RelationshipType
            setType(next)
            // Følg typens standard så lenge kadensen ikke er slått av.
            if (cadence !== null) setCadence(DEFAULT_CADENCE_WEEKS[next])
          }}
          className="flex flex-col gap-1.5"
        >
          <Label className="text-sm text-Text/60">Relasjon</Label>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <Radio
                key={t}
                value={t}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer border border-GlassBorder text-Text/60 transition-colors data-[hovered]:text-Text data-[selected]:text-Text data-[selected]:border-Accent data-[selected]:bg-Accent/15 data-[focus-visible]:outline-2 data-[focus-visible]:outline-Accent"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: RELATIONSHIP_COLORS[t] }}
                />
                {RELATIONSHIP_LABELS[t]}
              </Radio>
            ))}
          </div>
        </RadioGroup>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-cadence" className="text-sm text-Text/60">
            Minn meg på å ta kontakt
          </label>
          <select
            id="edit-cadence"
            value={cadence === null ? 'never' : String(cadence)}
            onChange={(e) =>
              setCadence(e.target.value === 'never' ? null : Number(e.target.value))
            }
            className="bg-Glass border border-GlassBorder rounded-xl px-3 py-2 text-Text focus:outline-none focus:border-Accent transition-colors"
          >
            {CADENCE_CHOICES.map((w) => (
              <option key={w} value={w} className="bg-Primary">
                {w === 1 ? 'Hver uke' : `Hver ${w}. uke`}
              </option>
            ))}
            <option value="never" className="bg-Primary">
              Aldri — ikke påminn om denne
            </option>
          </select>
        </div>

        <TextField
          label="Bursdag"
          description="Valgfritt"
          type="date"
          value={birthday}
          onChange={setBirthday}
        />

        <TextField label="Notat" multiline value={notes} onChange={setNotes} />

        <div className="flex flex-col gap-2">
          <span className="text-sm text-Text/60">Farge</span>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <Button
                key={c}
                variant="ghost"
                size="sm"
                onPress={() => setColor(c)}
                aria-label={`Velg farge ${c}`}
                className={`w-8 h-8 rounded-full p-0 ${
                  color === c ? 'ring-2 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button type="submit" isDisabled={saving || name.trim!()} className="flex-1">
            {saving ? 'Lagrer...' : 'Lagre'}
          </Button>
          <Button
            variant="glass"
            onPress={() => router.push(`/person/${person.id}`)}
            isDisabled={saving}
          >
            Avbryt
          </Button>
          {confirmDelete ? (
            <Button
              variant="glass"
              onPress={remove}
              isDisabled={saving}
              className="text-red-400! border-red-400/40!"
            >
              Slett for godt?
            </Button>
          ) : (
            <Button variant="ghost" onPress={() => setConfirmDelete(true)} isDisabled={saving}>
              Slett
            </Button>
          )}
        </div>

        {confirmDelete && (
          <p className="text-xs text-Text/40 -mt-2">
            Sletter også all logg, påminnelser og relasjoner for {person.name}.
          </p>
        )}
    </form>
  )
}
