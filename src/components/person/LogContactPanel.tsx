'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Radio, RadioGroup, Label } from 'react-aria-components'
import { TextField, Button } from '@/components/ui'
import type { LogEntryType } from '@/types'

const LOG_TYPES: { value: LogEntryType; label: string; emoji: string }[] = [
  { value: 'MET', label: 'Møttes', emoji: '☕' },
  { value: 'CALLED', label: 'Ringte', emoji: '📞' },
  { value: 'MESSAGE', label: 'Melding', emoji: '💬' },
  { value: 'OTHER', label: 'Annet', emoji: '📝' },
]

// toISOString() er UTC. Logger du 00:30 norsk sommertid, foreslo den gamle
// koden gårsdagens dato. sv-SE gir YYYY-MM-DD i lokal tid.
const today = () => new Date().toLocaleDateString('sv-SE')

export function LogContactPanel({ personId, personName }: { personId: string; personName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<LogEntryType>('MET')
  const [date, setDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, type, notes, date }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('Klarte ikke lagre. Prøv igjen.')
      return
    }

    setNotes('')
    setType('MET')
    setDate(today())
    setOpen(false)
    // Loggen ligger i en server-komponent, og en ny kontakt kan fjerne en
    // auto-påminnelse — begge deler krever at serveren rendrer på nytt.
    router.refresh()
  }

  const header = (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider">
        Kontaktlogg
      </h2>
      {!open && (
        <Button variant="secondary" size="sm" onPress={() => setOpen(true)}>
          + Logg kontakt
        </Button>
      )}
    </div>
  )

  if (!open) return header

  return (
    <>
      {header}
      <form onSubmit={submit} className="flex flex-col gap-3 mb-4 p-3 rounded-xl bg-white/4">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <RadioGroup
        value={type}
        onChange={(v) => setType(v as LogEntryType)}
        className="flex flex-col gap-1.5"
      >
        <Label className="text-xs text-Text/50">Hva skjedde med {personName}?</Label>
        <div className="flex flex-wrap gap-1.5">
          {LOG_TYPES.map((t) => (
            <Radio
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer border border-GlassBorder text-Text/60 transition-colors data-[hovered]:text-Text data-[selected]:text-Text data-[selected]:border-Accent data-[selected]:bg-Accent/15 data-[focus-visible]:outline-2 data-[focus-visible]:outline-Accent"
            >
              <span>{t.emoji}</span>
              {t.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>

      <TextField label="Dato" type="date" value={date} onChange={setDate} />
      <TextField
        label="Notat"
        description="Valgfritt"
        multiline
        rows={2}
        value={notes}
        onChange={setNotes}
        placeholder="Kaffe på Grünerløkka..."
      />

      <div className="flex gap-2">
        <Button variant="primary" type="submit" size="sm" isDisabled={saving} className="flex-1">
          {saving ? 'Lagrer...' : 'Lagre'}
        </Button>
        <Button variant="quiet" size="sm" onPress={() => setOpen(false)} isDisabled={saving}>
          Avbryt
        </Button>
        </div>
      </form>
    </>
  )
}
