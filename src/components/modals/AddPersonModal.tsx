'use client'

import { useState } from 'react'
import { Modal } from './Modal'

const COLOR_OPTIONS = [
  '#6c63ff', '#ef5350', '#29b6f6', '#ff6584',
  '#66bb6a', '#ffa726', '#ab47bc', '#26c6da',
]

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPersonModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6c63ff')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color, notes }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setName('')
    setColor('#6c63ff')
    setNotes('')
    onSuccess()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Legg til person">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Navn *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jenny Hansen"
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Notat (valgfritt)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vurderer å flytte til Amsterdam..."
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Farge</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Velg farge ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Legger til...' : 'Legg til'}
        </button>
      </form>
    </Modal>
  )
}
