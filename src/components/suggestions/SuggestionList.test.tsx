import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const acceptSuggestion = vi.fn()
const dismissSuggestion = vi.fn()
vi.mock('@/server/actions/suggestion', () => ({
  acceptSuggestion: (...a: unknown[]) => acceptSuggestion(...a),
  dismissSuggestion: (...a: unknown[]) => dismissSuggestion(...a),
}))

import { SuggestionList } from './SuggestionList'
import { ToastProvider } from '@/components/toast/ToastProvider'

const items = [
  { id: 's1', kind: 'THREAD' as const, title: 'Andre intervjurunde', people: ['Ingrid Aas'] },
  { id: 's2', kind: 'PERSON' as const, name: 'Kari Nordmann', log: 'Middag hos Kari' },
]

beforeEach(() => {
  acceptSuggestion.mockReset()
  dismissSuggestion.mockReset()
})

function setup() {
  render(
    <ToastProvider>
      <SuggestionList items={items} />
    </ToastProvider>,
  )
  return userEvent.setup()
}

it('godtar et forslag med ett trykk og fjerner det fra lista', async () => {
  acceptSuggestion.mockResolvedValue({ ok: true, data: { kind: 'THREAD' } })
  const user = setup()
  await user.click(screen.getAllByRole('button', { name: 'Legg til' })[0])
  expect(acceptSuggestion).toHaveBeenCalledWith('s1')
  expect(screen.queryByText('Spør om: Andre intervjurunde')).not.toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('La til tråd.')).toBeInTheDocument())
})

it('avviser, og viser forslaget igjen hvis det feilet', async () => {
  dismissSuggestion.mockResolvedValue({ ok: false, error: 'failed' })
  const user = setup()
  await user.click(screen.getByRole('button', { name: 'Avvis: Legg til Kari Nordmann' }))
  expect(dismissSuggestion).toHaveBeenCalledWith('s2')
  await waitFor(() => expect(screen.getByText('Legg til Kari Nordmann')).toBeInTheDocument())
  expect(screen.getByRole('alert')).toBeInTheDocument()
})

it('viser ingenting uten forslag', () => {
  const { container } = render(<SuggestionList items={[]} />)
  expect(container).toBeEmptyDOMElement()
})
