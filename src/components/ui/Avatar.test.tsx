import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

it('viser initialer og har navnet som tilgjengelig etikett', () => {
  render(<Avatar name="Ingrid Aas" />)
  expect(screen.getByRole('img', { name: 'Ingrid Aas' })).toHaveTextContent('IA')
})

it('viser bilde i stedet for initialer når src finnes', () => {
  render(<Avatar name="Ingrid Aas" src="https://lh3.googleusercontent.com/a/ingrid" />)
  const avatar = screen.getByRole('img', { name: 'Ingrid Aas' })
  expect(avatar.querySelector('img')).toBeInTheDocument()
  expect(avatar).not.toHaveTextContent('IA')
})
