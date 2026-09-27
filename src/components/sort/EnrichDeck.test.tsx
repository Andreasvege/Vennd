import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const enrichPerson = vi.fn()
vi.mock('@/server/actions/sort', () => ({ enrichPerson: (...a: unknown[]) => enrichPerson(...a) }))
vi.mock('@/server/actions/person', () => ({ createPerson: vi.fn() }))
vi.mock('@/server/actions/tag', () => ({ createTag: vi.fn() }))
vi.mock('@/server/actions/tell', () => ({ tellAbout: vi.fn(), applyTell: vi.fn() }))
vi.mock('@/components/toast/ToastProvider', () => ({ useToast: () => vi.fn() }))

import { EnrichDeck } from './EnrichDeck'
import type { EnrichData } from '@/server/queries/enrich'
import type { Gap } from '@/domain/enrich'

const person = (id: string, name: string, gaps: Gap[]) => ({
  id,
  name,
  photoUrl: null,
  tint: 'ochre' as const,
  type: 'FRIEND' as const,
  relationLabel: gaps.includes('who') ? null : 'studievenn',
  phase: null,
  cadenceWeeks: 4,
  birthday: null,
  primaryTag: { id: 'radio', name: 'Studentradio', color: 'ochre' },
  tagIds: ['radio'],
  facts: [{ label: 'Jobb', value: 'NRK' }],
  factCount: 1,
  relationshipCount: 1,
  lastContact: null,
  gaps,
})

const data: EnrichData = {
  deck: [person('a', 'Ingrid Aas', ['seen', 'birthday']), person('b', 'Martin Nilsen', ['who'])],
  everyone: [
    { id: 'a', name: 'Ingrid Aas', tint: 'ochre', tagIds: ['radio'] },
    { id: 'b', name: 'Martin Nilsen', tint: 'ochre', tagIds: ['radio'] },
    { id: 's', name: 'Sofie Lund', tint: 'ochre', tagIds: ['radio'] },
  ],
  tags: [{ id: 'radio', name: 'Studentradio', color: 'ochre' }],
  pairs: [['a', 's']],
  withGaps: 2,
  aiEnabled: false,
}

beforeEach(() => {
  enrichPerson.mockReset().mockResolvedValue({ ok: true, data: { relationships: 0 } })
})

const current = () => screen.getByRole('heading', { level: 1 }).textContent

it('spør bare om det som mangler, og lagrer bare det du fylte inn', async () => {
  const user = userEvent.setup()
  render(<EnrichDeck data={data} />)
  expect(current()).toBe('Ingrid Aas')
  // Sist sett og bursdag mangler; miljø og hvem de kjenner er kjent.
  expect(screen.getByText('Når så dere hverandre sist?')).toBeInTheDocument()
  expect(screen.queryByText('Miljø')).not.toBeInTheDocument()

  await user.click(screen.getByRole('radio', { name: 'Siste måneden' }))
  await user.click(screen.getByRole('button', { name: /Lagre og neste/ }))

  await waitFor(() => expect(current()).toBe('Martin Nilsen'))
  const input = enrichPerson.mock.calls[0][0]
  expect(input).toMatchObject({ personId: 'a', who: null, tagIds: null, knows: [], birthday: null, facts: [] })
  expect(input.seen.choice).toBe('month')
  expect(input.seen.on).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})

it('«Vis alt» viser også det som er fylt inn, og et nytt faktum lagres', async () => {
  const user = userEvent.setup()
  render(<EnrichDeck data={data} />)
  await user.click(screen.getByRole('button', { name: 'Vis alt' }))
  expect(screen.getByText('Miljø')).toBeInTheDocument()
  // Jobb finnes fra før, så den foreslås ikke igjen.
  expect(screen.queryByRole('button', { name: 'Jobb' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Bor' }))
  await user.type(screen.getByRole('textbox', { name: 'Bor' }), 'Grünerløkka')
  await user.click(screen.getByRole('button', { name: /Lagre og neste/ }))
  await waitFor(() => expect(enrichPerson).toHaveBeenCalled())
  expect(enrichPerson.mock.calls[0][0].facts).toEqual([{ label: 'Bor', value: 'Grünerløkka' }])
})

it('hopp over legger kortet sist, og tom stokk sier at ingenting mangler', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<EnrichDeck data={data} />)
  await user.click(screen.getByRole('button', { name: 'Hopp over' }))
  expect(current()).toBe('Martin Nilsen')
  unmount()
  render(<EnrichDeck data={{ ...data, deck: [] }} />)
  expect(current()).toBe('Ingenting mangler')
})

it('deler en lang stokk i økter på 15', async () => {
  const user = userEvent.setup()
  const many = Array.from({ length: 17 }, (_, i) => person(`p${i}`, `Person ${i}`, ['birthday']))
  render(<EnrichDeck data={{ ...data, deck: many }} />)
  expect(screen.getByText('0 av 15')).toBeInTheDocument()
  for (let i = 0; i < 15; i++) await user.click(screen.getByRole('button', { name: /Lagre og neste/ }))
  await waitFor(() => expect(screen.getByRole('button', { name: '2 til' })).toBeInTheDocument())
  await user.click(screen.getByRole('button', { name: '2 til' }))
  expect(current()).toBe('Person 15')
})
