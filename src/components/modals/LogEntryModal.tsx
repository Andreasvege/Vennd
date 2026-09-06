'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import type { Person, LogEntryType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultPersonId?: string
}

const LOG_TYPES: { value: LogEntryType; label: string; emoji: string }[] = [
  { value: 'MET', label: 'Møttes', emoji: '☕' },
  { value: 'CALLED', label: 'Ringte', emoji: '📞' },
  { value: 'MESSAGE', label: 'Melding', emoji: '💬' },
  { value: 'OTHER', label: 'Annet', emoji: '📝' },
]

export function LogEntryModal({ isOpen, onClose, onSuccess, defaultPersonId }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [personId, setPersonId] = useState(defaultPersonId ?? '')
  const [type, setType] = useState<LogEntryType>('MET')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modalen holdes montert mellom åpninger, så state må synkes mot props når
  // den åpnes på nytt (React-mønsteret «juster state under render»).
  const [prevKey, setPrevKey] = useState(`${isOpen}-${defaultPersonId ?? ''}`)
  const key = `${isOpen}-${defaultPersonId ?? ''}`
  if (key !== prevKey) {
    setPrevKey(key)
    if (isOpen && defaultPersonId) setPersonId(defaultPersonId)
  }

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/persons')
      .then((r) => r.json())
      .then(setPersons)
      .catch(() => setError('Klarte ikke hente personer.'))
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
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setNotes('')
    setType('MET')
    onSuccess()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Logg kontakt">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Person *</label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors"
          >
            <option value="">Velg person...</option>
            {persons.map((p: Person) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Type</label>
          <div className="flex gap-2">
            {LOG_TYPES.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                  type === value
                    ? 'bg-Accent/20 border-Accent text-Accent'
                    : 'border-white/10 text-Text/60 hover:border-white/30'
                }`}
              >
                <div>{emoji}</div>
                <div>{label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Dato</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Notat (valgfritt)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vi snakket om..."
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !personId}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Lagrer...' : 'Logg kontakt'}
        </button>
      </form>
    </Modal>
  )
}
