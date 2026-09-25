'use client'

import { useState } from 'react'
import { Radio, RadioGroup, Label } from 'react-aria-components'
import { Dialog, TextField, Button } from '@/components/ui'
import { RELATIONSHIP_COLORS, RELATIONSHIP_LABELS } from '@/lib/relationship-colors'
import { DEFAULT_CADENCE_WEEKS } from '@/lib/cadence'
import type { RelationshipType } from '@/types'

const COLOR_OPTIONS = [
  '#6c63ff', '#ef5350', '#29b6f6', '#ff6584',
  '#66bb6a', '#ffa726', '#ab47bc', '#26c6da',
]

const TYPES = Object.keys(RELATIONSHIP_COLORS) as RelationshipType[]

// «Aldri» sendes som null og slår av auto-påminnelser for personen.
const CADENCE_CHOICES = [1, 2, 3, 4, 6, 8, 12, 26, 52] as const

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPersonModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6c63ff')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState<RelationshipType>('FRIEND')
  // null = aldri påminn. Settes automatisk fra typen til brukeren rører feltet.
  const [cadence, setCadence] = useState<number | null>(DEFAULT_CADENCE_WEEKS.FRIEND)
  const [cadenceTouched, setCadenceTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const chooseType = (next: RelationshipType) => {
    setType(next)
    if (!cadenceTouched) setCadence(DEFAULT_CADENCE_WEEKS[next])
  }

  const chooseCadence = (value: string) => {
    setCadenceTouched(true)
    setCadence(value === 'never' ? null : Number(value))
  }

  const reset = () => {
    setName('')
    setColor('#6c63ff')
    setNotes('')
    setType('FRIEND')
    setCadence(DEFAULT_CADENCE_WEEKS.FRIEND)
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
        color,
        notes,
        type,
        cadenceWeeks: cadence,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    reset()
    onSuccess()
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Legg til person"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <TextField
          label="Navn"
          isRequired
          value={name}
          onChange={setName}
          placeholder="Jenny Hansen"
          autoFocus
        />

        <RadioGroup
          value={type}
          onChange={(v) => chooseType(v as RelationshipType)}
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
          <label htmlFor="cadence" className="text-sm text-Text/60">
            Minn meg på å ta kontakt
          </label>
          <select
            id="cadence"
            value={cadence === null ? 'never' : String(cadence)}
            onChange={(e) => chooseCadence(e.target.value)}
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
          <p className="text-xs text-Text/30">
            Foreslått fra relasjonstypen. 14 av personene dine har ingen logg — sett
            «Aldri» på dem du bare vil ha på kartet.
          </p>
        </div>

        <TextField
          label="Notat"
          description="Valgfritt"
          multiline
          value={notes}
          onChange={setNotes}
          placeholder="Vurderer å flytte til Amsterdam..."
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm text-Text/60">Farge</span>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <Button
                key={c}
                variant="quiet"
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

        <Button variant="primary" type="submit" isDisabled={loading || !name.trim()} className="mt-2 w-full">
          {loading ? 'Legger til...' : 'Legg til'}
        </Button>
      </form>
    </Dialog>
  )
}
