import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sortPerson = vi.fn()
const archivePersons = vi.fn()
const restorePerson = vi.fn()
vi.mock('@/server/actions/sort', () => ({
  sortPerson: (...a: unknown[]) => sortPerson(...a),
  archivePersons: (...a: unknown[]) => archivePersons(...a),
  restorePerson: (...a: unknown[]) => restorePerson(...a),
}))
vi.mock('@/server/actions/person', () => ({ createPerson: vi.fn() }))
vi.mock('@/server/actions/tag', () => ({ createTag: vi.fn() }))

import { CardDeck } from './CardDeck'
import type { SortingData } from '@/server/queries/sorting'

const person = (id: string, name: string) => ({
  id,
  name,
  birthday: null,
  notes: null,
  photoUrl: null,
  tint: 'stone' as const,
  tagIds: [],
  phone: null,
  email: null,
  logCount: 0,
})

const data: SortingData = {
  unsorted: [person('a', 'Anders Aas'), person('b', 'Berit Berg')],
  sorted: [{ id: 's', name: 'Sofie Lund', tint: 'ochre', tagIds: ['radio'] }],
  tags: [{ id: 'radio', name: 'Studentradio', color: 'ochre', count: 1 }],
  pairs: [],
  archived: [],
}

beforeEach(() => {
  sortPerson.mockReset().mockResolvedValue({ ok: true, data: { relationships: 1 } })
  archivePersons.mockReset().mockResolvedValue({ ok: true, data: { count: 1 } })
  restorePerson.mockReset().mockResolvedValue({ ok: true })
})

const current = () => screen.getByRole('heading', { level: 1 }).textContent

it('lagrer nærhet, miljø og hvem de kjenner, og går til neste kort', async () => {
  const user = userEvent.setup()
  render(<CardDeck data={data} />)
  expect(current()).toBe('Anders Aas')

  await user.click(screen.getByRole('radio', { name: 'Familie' }))
  await user.click(screen.getByRole('radio', { name: 'fetter' }))
  await user.click(screen.getByRole('radio', { name: 'Hver 3. måned' }))
  await user.click(screen.getByRole('button', { name: 'Studentradio' }))
  // Med et miljø valgt foreslås de som alt står på kartet i det miljøet.
  await user.click(screen.getByRole('button', { name: /Sofie Lund/ }))
  await user.click(screen.getByRole('button', { name: /^Neste/ }))

  await waitFor(() => expect(current()).toBe('Berit Berg'))
  expect(sortPerson).toHaveBeenCalledWith({
    personId: 'a',
    type: 'FAMILY',
    relationLabel: 'fetter',
    phase: null,
    cadenceWeeks: 12,
    tagIds: ['radio'],
    knows: ['s'],
  })
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 av 2')
})

it('hopper over ved å legge kortet bakerst', async () => {
  const user = userEvent.setup()
  render(<CardDeck data={data} />)
  await user.click(screen.getByRole('button', { name: 'Hopp over' }))
  expect(current()).toBe('Berit Berg')
  expect(sortPerson).not.toHaveBeenCalled()
})

it('tar ut av kartet, og Angre henter personen tilbake', async () => {
  const user = userEvent.setup()
  render(<CardDeck data={data} />)
  await user.click(screen.getByRole('button', { name: 'Ikke i kartet' }))
  await waitFor(() => expect(current()).toBe('Berit Berg'))
  expect(archivePersons).toHaveBeenCalledWith(['a'])

  await user.click(screen.getByRole('button', { name: 'Angre' }))
  await waitFor(() => expect(current()).toBe('Anders Aas'))
  expect(restorePerson).toHaveBeenCalledWith('a')
})

it('viser ferdig-skjermen når stokken er tom', async () => {
  const user = userEvent.setup()
  render(<CardDeck data={{ ...data, unsorted: [person('a', 'Anders Aas')] }} />)
  await user.click(screen.getByRole('button', { name: /^Neste/ }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Alle har en plass' })).toBeInTheDocument())
})

it('neste kort vet hvem hun kjenner, foreslår nettverket og velger miljøet med en gang', async () => {
  const user = userEvent.setup()
  // Berit er allerede koblet til Anders.
  render(<CardDeck data={{ ...data, pairs: [['b', 'a']] }} />)

  // Kort 1: Anders er i Studentradio og kjenner Sofie.
  await user.click(screen.getByRole('button', { name: 'Studentradio' }))
  await user.click(screen.getByRole('button', { name: /Sofie Lund/ }))
  await user.click(screen.getByRole('button', { name: /^Neste/ }))
  await waitFor(() => expect(current()).toBe('Berit Berg'))

  // Kort 2: uten å gjøre noe står Anders som kjent, Sofie som forslag, og miljøet er valgt.
  expect(screen.getByText('Kjenner allerede')).toBeInTheDocument()
  expect(screen.getByText('Anders Aas')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Sofie Lund/ })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Studentradio' })).toHaveAttribute('aria-pressed', 'true')
})

it('romantisk spør om fasen, og en eks får ingen påminnelse', async () => {
  const user = userEvent.setup()
  render(<CardDeck data={data} />)
  await user.click(screen.getByRole('radio', { name: 'Romantisk' }))
  await user.click(screen.getByRole('radio', { name: 'Eks' }))
  expect(screen.getByRole('radio', { name: 'Aldri' })).toBeChecked()
  await user.click(screen.getByRole('button', { name: /^Neste/ }))
  await waitFor(() => expect(sortPerson).toHaveBeenCalledWith(expect.objectContaining({ type: 'ROMANTIC', phase: 'ENDED', cadenceWeeks: null })))
})

it('forslagene vokser når du krysser av', async () => {
  const user = userEvent.setup()
  // Sofie kjenner Mia; Mia er ikke foreslått før Sofie er valgt.
  const withNet: SortingData = {
    ...data,
    sorted: [...data.sorted, { id: 'm', name: 'Mia Moe', tint: 'stone', tagIds: [] }],
    pairs: [['s', 'm']],
  }
  render(<CardDeck data={withNet} />)
  await user.click(screen.getByRole('button', { name: 'Studentradio' }))
  expect(screen.queryByRole('button', { name: /Mia Moe/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Sofie Lund/ }))
  expect(screen.getByRole('button', { name: /Mia Moe/ })).toBeInTheDocument()
})
