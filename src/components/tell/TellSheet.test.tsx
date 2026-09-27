import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const tellAbout = vi.fn()
const applyTell = vi.fn()
vi.mock('@/server/actions/tell', () => ({
  tellAbout: (...a: unknown[]) => tellAbout(...a),
  applyTell: (...a: unknown[]) => applyTell(...a),
}))
vi.mock('@/components/toast/ToastProvider', () => ({ useToast: () => vi.fn() }))

import { TellSheet } from './TellSheet'

beforeEach(() => {
  tellAbout.mockReset().mockResolvedValue({
    ok: true,
    data: {
      proposals: [
        { kind: 'FACT', personId: 'i', name: 'Ingrid Aas', label: 'Jobb', value: 'Equinor' },
        { kind: 'RELATION', a: { id: 'i', name: 'Ingrid Aas' }, b: { id: null, name: 'Erik Aas' }, type: 'FAMILY', label: 'søsken' },
      ],
    },
  })
  applyTell.mockReset().mockResolvedValue({ ok: true, data: { added: 1 } })
})

it('leser teksten, viser forslagene og legger inn bare dem du krysset av', async () => {
  const user = userEvent.setup()
  const onApplied = vi.fn()
  render(<TellSheet person={{ id: 'i', name: 'Ingrid Aas' }} isOpen onClose={() => {}} onApplied={onApplied} />)
  await user.type(screen.getByRole('textbox'), 'Jobber i Equinor. Broren heter Erik.')
  await user.click(screen.getByRole('button', { name: 'Les' }))
  expect(tellAbout).toHaveBeenCalledWith({ personId: 'i', text: 'Jobber i Equinor. Broren heter Erik.' })

  expect(await screen.findByText('Jobb: Equinor')).toBeInTheDocument()
  expect(screen.getByText('ny: Erik Aas')).toBeInTheDocument()
  await user.click(screen.getByRole('checkbox', { name: /Ingrid og Erik/ }))
  await user.click(screen.getByRole('button', { name: 'Legg inn 1' }))

  await waitFor(() => expect(applyTell).toHaveBeenCalled())
  expect(applyTell.mock.calls[0][0].proposals).toEqual([
    { kind: 'FACT', personId: 'i', name: 'Ingrid Aas', label: 'Jobb', value: 'Equinor' },
  ])
  expect(onApplied).toHaveBeenCalled()
})

it('sier fra når Claude ikke svarer', async () => {
  tellAbout.mockResolvedValue({ ok: false, error: 'failed' })
  const user = userEvent.setup()
  render(<TellSheet person={{ id: 'i', name: 'Ingrid Aas' }} isOpen onClose={() => {}} />)
  await user.type(screen.getByRole('textbox'), 'Noe om henne')
  await user.click(screen.getByRole('button', { name: 'Les' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Claude svarte ikke')
})
