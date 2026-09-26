import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const acceptInsight = vi.fn()
const dismissInsight = vi.fn()
const acceptLinks = vi.fn()
const dismissLinks = vi.fn()
vi.mock('@/server/actions/links', () => ({
  acceptInsight: (...a: unknown[]) => acceptInsight(...a),
  dismissInsight: (...a: unknown[]) => dismissInsight(...a),
  acceptLinks: (...a: unknown[]) => acceptLinks(...a),
  dismissLinks: (...a: unknown[]) => dismissLinks(...a),
}))

import { GroupSuggestions } from './GroupSuggestions'
import { ToastProvider } from '@/components/toast/ToastProvider'
import type { GroupSuggestions as Data } from '@/server/queries/links'

const p = (id: string, name: string) => ({ id, name, tint: 'stone' as const, photoUrl: null })
const data: Data = {
  fromClaude: [
    {
      id: 'i1',
      title: 'Vege-søsknene',
      reason: 'Alle er søskenbarn av Nora og heter Vege.',
      kind: 'group',
      hub: null,
      members: [p('h', 'Håvard Vege'), p('s', 'Selma Vege'), p('a', 'August Vege')],
      type: 'FAMILY',
      label: 'søsken',
      groupName: 'Vege',
      count: 3,
    },
  ],
  fromRules: [
    {
      key: 'tag:radio|tag:klatring',
      sides: [
        { label: 'Klatring', members: [p('e', 'Emil Haug')] },
        { label: 'Radio Nova', members: [p('i', 'Ingrid Aas'), p('j', 'Jonas Rud')] },
      ],
      pairs: [
        ['e', 'i'],
        ['e', 'j'],
      ],
      hubs: ['Martin Nilsen', 'Sofie Lund'],
      sameSurname: false,
      type: 'FRIEND',
    },
  ],
}

beforeEach(() => {
  acceptInsight.mockReset().mockResolvedValue({ ok: true, data: { created: 1 } })
  dismissInsight.mockReset().mockResolvedValue({ ok: true })
  acceptLinks.mockReset().mockResolvedValue({ ok: true, data: { created: 1 } })
  dismissLinks.mockReset().mockResolvedValue({ ok: true })
})

const setup = () => {
  render(
    <ToastProvider>
      <GroupSuggestions data={data} />
    </ToastProvider>,
  )
  return userEvent.setup()
}

it('én innsikt, ett svar: velg bort én, og miljøet lages', async () => {
  const user = setup()
  const card = screen.getByText('Vege-søsknene').closest('li')!
  expect(within(card).getByRole('button', { name: 'Legg til 3 forbindelser' })).toBeInTheDocument()
  await user.click(within(card).getByRole('button', { name: 'Velg hvem' }))
  await user.click(within(card).getByRole('button', { name: /August Vege/ }))
  await user.click(within(card).getByRole('button', { name: 'Legg til forbindelsen' }))
  expect(acceptInsight).toHaveBeenCalledWith({ id: 'i1', memberIds: ['h', 's'], createGroup: true })
  await waitFor(() => expect(screen.queryByText('Vege-søsknene')).not.toBeInTheDocument())
})

it('reglenes gruppe er ett spørsmål mellom to miljøer, med to rader', async () => {
  const user = setup()
  const card = screen.getByText('Klatring og Radio Nova: kjenner de hverandre?').closest('li')!
  expect(within(card).getByText('De kjenner begge Martin og Sofie.')).toBeInTheDocument()
  expect(within(card).getByRole('button', { name: 'Legg til 2 forbindelser' })).toBeInTheDocument()
  // Velg bort Jonas: bare Emil–Ingrid står igjen.
  await user.click(within(card).getByRole('button', { name: 'Velg hvem' }))
  await user.click(within(card).getByRole('button', { name: /Jonas Rud/ }))
  await user.click(within(card).getByRole('button', { name: 'Legg til forbindelsen' }))
  expect(acceptLinks).toHaveBeenCalledWith([['e', 'i']])
})

it('«Nei takk» avviser alle parene i gruppen', async () => {
  const user = setup()
  const card = screen.getByText('Klatring og Radio Nova: kjenner de hverandre?').closest('li')!
  await user.click(within(card).getByRole('button', { name: 'Nei takk' }))
  expect(dismissLinks).toHaveBeenCalledWith([
    ['e', 'i'],
    ['e', 'j'],
  ])
})
