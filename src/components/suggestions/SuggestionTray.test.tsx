import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const acceptSuggestion = vi.fn()
vi.mock('@/server/actions/suggestion', () => ({
  acceptSuggestion: (...a: unknown[]) => acceptSuggestion(...a),
  dismissSuggestion: vi.fn(),
}))
vi.mock('@/components/toast/ToastProvider', () => ({ useToast: () => vi.fn() }))

import { SuggestionTray } from './SuggestionTray'

it('sier fra mens Claude leser, og når det ikke var noe', () => {
  const { rerender } = render(<SuggestionTray tray={{ logId: 'l', items: null }} onClose={() => {}} />)
  expect(screen.getByRole('status')).toHaveTextContent('Claude leser loggen')
  rerender(<SuggestionTray tray={{ logId: 'l', items: [] }} onClose={() => {}} />)
  expect(screen.getByRole('status')).toHaveTextContent('fant ingenting')
})

it('«Legg til alle» godtar alle, og skuffen sier at alt er besvart', async () => {
  acceptSuggestion.mockResolvedValue({ ok: true, data: { kind: 'FACT' } })
  const user = userEvent.setup()
  render(
    <SuggestionTray
      tray={{
        logId: 'l',
        items: [
          { id: 'a', logId: 'l', kind: 'FACT', person: 'Liv Olsen', label: 'Jobb', value: 'Ahus' },
          { id: 'b', logId: 'l', kind: 'RELATIONSHIP', a: 'Liv Olsen', b: 'Brage Vik', label: 'kjærester' },
        ],
      }}
      onClose={() => {}}
    />,
  )
  expect(screen.getByText('Liv og Brage: kjærester')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Legg til alle' }))
  expect(await screen.findByText('Alt er besvart.')).toBeInTheDocument()
  expect(acceptSuggestion).toHaveBeenCalledTimes(2)
})
