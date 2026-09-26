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
      key: 'hub:m',
      hub: p('m', 'Martin Nilsen'),
      members: [p('i', 'Ingrid Aas'), p('e', 'Emil Haug')],
      pairs: [['e', 'i']],
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

it('reglenes gruppe: to personer får et tydelig spørsmål, og «Nei takk» avviser parene', async () => {
  const user = setup()
  const card = screen.getByText('Kjenner Ingrid og Emil hverandre?').closest('li')!
  expect(within(card).getByText('Begge kjenner Martin.')).toBeInTheDocument()
  await user.click(within(card).getByRole('button', { name: 'Nei takk' }))
  expect(dismissLinks).toHaveBeenCalledWith([['e', 'i']])
})
