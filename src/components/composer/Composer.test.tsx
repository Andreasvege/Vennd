import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const createLog = vi.fn()
vi.mock('@/server/actions/log', () => ({ createLog: (...args: unknown[]) => createLog(...args) }))
vi.mock('@/server/actions/person', () => ({ createPerson: vi.fn() }))

import { Composer } from './Composer'
import { ToastProvider } from '@/components/toast/ToastProvider'

const data = {
  persons: [
    { id: 'martin', name: 'Martin Nilsen', tint: 'ochre' as const },
    { id: 'ingrid', name: 'Ingrid Aas', tint: 'sage' as const },
  ],
  threads: [{ id: 't1', title: 'Fjellturen', personIds: ['martin'] }],
}

beforeEach(() => {
  createLog.mockReset()
  localStorage.clear()
})

function setup() {
  const onClose = vi.fn()
  render(
    <ToastProvider>
      <Composer isOpen onClose={onClose} data={data} />
    </ToastProvider>,
  )
  return { onClose, user: userEvent.setup() }
}

it('finner personen i teksten og lagrer loggen med henne', async () => {
  createLog.mockResolvedValue({ ok: true, data: { id: 'l1', closed: 0, opened: 0 } })
  const { user, onClose } = setup()

  await user.type(screen.getByRole('textbox', { name: 'Hva skjedde?' }), 'Middag med Martin')
  expect(screen.getByRole('button', { name: 'Fjern Martin Nilsen' })).toBeInTheDocument()
  // Martins åpne tråd dukker opp så snart han er med.
  expect(screen.getByRole('checkbox', { name: /Fjellturen/ })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Lagre' }))
  await waitFor(() => expect(onClose).toHaveBeenCalled())
  expect(createLog).toHaveBeenCalledWith(expect.objectContaining({ personIds: ['martin'], body: 'Middag med Martin' }))
})

it('lagrer bare én gang ved dobbeltklikk', async () => {
  let resolve!: (v: unknown) => void
  createLog.mockReturnValue(new Promise((r) => (resolve = r)))
  const { user } = setup()

  await user.type(screen.getByRole('textbox', { name: 'Hva skjedde?' }), 'Ringte Ingrid Aas')
  const save = screen.getByRole('button', { name: 'Lagre' })
  await user.dblClick(save)
  resolve({ ok: true, data: { id: 'l1', closed: 0, opened: 0 } })
  await waitFor(() => expect(createLog).toHaveBeenCalledTimes(1))
})

it('ber om en person før den lagrer', async () => {
  const { user } = setup()
  await user.type(screen.getByRole('textbox', { name: 'Hva skjedde?' }), 'Tur alene')
  await user.click(screen.getByRole('button', { name: 'Lagre' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Velg minst én person')
  expect(createLog).not.toHaveBeenCalled()
})

it('legger ikke til igjen en person du har fjernet', async () => {
  const { user } = setup()
  const text = screen.getByRole('textbox', { name: 'Hva skjedde?' })
  await user.type(text, 'Middag med Martin')
  await user.click(screen.getByRole('button', { name: 'Fjern Martin Nilsen' }))
  await user.type(text, ' og Martin igjen')
  expect(screen.queryByRole('button', { name: 'Fjern Martin Nilsen' })).not.toBeInTheDocument()
})
