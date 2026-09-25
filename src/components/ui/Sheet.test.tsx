import { it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sheet } from './Sheet'

it('har tittel og lukkes med Escape', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <Sheet isOpen onOpenChange={onOpenChange} title="Ny person">
      <input aria-label="Navn" />
    </Sheet>,
  )
  expect(screen.getByRole('dialog', { name: 'Ny person' })).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(onOpenChange).toHaveBeenCalledWith(false)
})

it('lukkes med lukkeknappen', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <Sheet isOpen onOpenChange={onOpenChange} title="Ny person">
      <p>Innhold</p>
    </Sheet>,
  )
  await user.click(screen.getByRole('button', { name: 'Lukk' }))
  expect(onOpenChange).toHaveBeenCalledWith(false)
})

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Åpne</button>
      <Sheet isOpen={open} onOpenChange={setOpen} title="Ny person">
        <input aria-label="Navn" />
        <button>Lagre</button>
      </Sheet>
    </>
  )
}

it('fanger fokus, lar Tab gå rundt og gir fokus tilbake ved lukking', async () => {
  const user = userEvent.setup()
  render(<Harness />)
  const trigger = screen.getByRole('button', { name: 'Åpne' })
  await user.click(trigger)

  const dialog = await screen.findByRole('dialog', { name: 'Ny person' })
  expect(dialog).toContainElement(document.activeElement as HTMLElement)

  // Rundt hele arket: lukkeknapp, felt, lagre — og tilbake igjen, aldri ut.
  for (let i = 0; i < 5; i++) {
    await user.tab()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  }

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  // react-aria gir fokus tilbake i neste animasjonsramme.
  await waitFor(() => expect(trigger).toHaveFocus())
})
