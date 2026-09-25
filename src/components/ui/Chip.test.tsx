import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChipGroup } from './Chip'

const options = [
  { value: 'MET', label: 'Møttes' },
  { value: 'CALLED', label: 'Ringte' },
] as const

it('velger med klikk', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ChipGroup label="Type" value="MET" onChange={onChange} options={[...options]} />)
  await user.click(screen.getByRole('radio', { name: 'Ringte' }))
  expect(onChange).toHaveBeenLastCalledWith('CALLED')
})

it('velger med piltaster', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ChipGroup label="Type" value="MET" onChange={onChange} options={[...options]} />)
  await user.tab()
  expect(screen.getByRole('radio', { name: 'Møttes' })).toHaveFocus()
  await user.keyboard('{ArrowRight}')
  expect(onChange).toHaveBeenLastCalledWith('CALLED')
})
