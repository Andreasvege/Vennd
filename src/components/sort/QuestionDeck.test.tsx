import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const answerQuestion = vi.fn()
vi.mock('@/server/actions/questions', () => ({ answerQuestion: (...a: unknown[]) => answerQuestion(...a) }))
vi.mock('@/components/toast/ToastProvider', () => ({ useToast: () => vi.fn() }))

import { QuestionDeck } from './QuestionDeck'

beforeEach(() => answerQuestion.mockReset().mockResolvedValue({ ok: true, data: { people: 2 } }))
const heading = () => screen.getByRole('heading', { level: 1 }).textContent

it('svarer med en du har og et nytt navn, og går videre', async () => {
  const user = userEvent.setup()
  render(<QuestionDeck everyone={[{ id: 'i', name: 'Ingrid Aas', tint: 'ochre' }]} />)
  expect(heading()).toMatch(/gode nyheter/)
  const box = screen.getByRole('combobox')
  await user.type(box, 'Ingr')
  await user.click(await screen.findByRole('option', { name: /Ingrid Aas/ }))
  await user.type(box, 'Kari Nordmann')
  await user.click(await screen.findByRole('option', { name: /Kari Nordmann/ }))
  expect(screen.getByText(/Påminnelse: hver 2. uke/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Neste' }))
  await waitFor(() => expect(heading()).toMatch(/savner/))
  expect(answerQuestion.mock.calls[0][0]).toMatchObject({
    questionId: 'goodNews',
    personIds: ['i'],
    newNames: ['Kari Nordmann'],
    groupName: null,
  })
})

it('uten svar går «Neste» videre uten å lagre, og miljøet kan få nytt navn', async () => {
  const user = userEvent.setup()
  render(<QuestionDeck everyone={[]} />)
  await user.click(screen.getByRole('button', { name: 'Neste' }))
  await user.click(screen.getByRole('button', { name: 'Hopp over' }))
  expect(heading()).toMatch(/bodd sammen/)
  expect(screen.getByRole('textbox', { name: 'Miljøet' })).toHaveValue('Kollektivet')
  expect(answerQuestion).not.toHaveBeenCalled()
})
