import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
