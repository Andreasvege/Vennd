'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/lib/relationship-colors'
import type { Person, RelationshipType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]

export function AddRelationshipModal({ isOpen, onClose, onSuccess }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [type, setType] = useState<RelationshipType>('FRIEND')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/persons')
      .then((r) => r.json())
      .then(setPersons)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId || fromId === toId) {
      setError('Velg to forskjellige personer')
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
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setFromId('')
    setToId('')
    setType('FRIEND')
    onSuccess()
    onClose()
  }

  const selectClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors w-full"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Legg til relasjon">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Fra person</label>
          <select value={fromId} onChange={(e) => setFromId(e.target.value)} className={selectClass}>
            <option value="">Velg person...</option>
            {persons.map((p: Person) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Til person</label>
          <select value={toId} onChange={(e) => setToId(e.target.value)} className={selectClass}>
            <option value="">Velg person...</option>
            {persons.filter((p: Person) => p.id !== fromId).map((p: Person) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Relasjonstype</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map((t: RelationshipType) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                  type === t
                    ? 'text-Primary border-transparent'
                    : 'text-Text/60 border-white/10 hover:border-white/30'
                }`}
                style={type === t ? { backgroundColor: RELATIONSHIP_COLORS[t] } : {}}
              >
                {RELATIONSHIP_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !fromId || !toId}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Legger til...' : 'Legg til relasjon'}
        </button>
      </form>
    </Modal>
  )
}
