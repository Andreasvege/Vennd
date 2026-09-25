import { it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

it('lagrer valgt tema og setter det på <html>', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  await user.click(screen.getByText('Mørk'))
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
})

it('«Som systemet» fjerner både lagring og attributt', async () => {
  const user = userEvent.setup()
  localStorage.setItem('theme', 'light')
  document.documentElement.dataset.theme = 'light'
  render(<ThemeToggle />)
  expect(screen.getByRole('radio', { name: 'Lys' })).toBeChecked()
  await user.click(screen.getByText('Som systemet'))
  expect(localStorage.getItem('theme')).toBeNull()
  expect(document.documentElement.dataset.theme).toBeUndefined()
})
