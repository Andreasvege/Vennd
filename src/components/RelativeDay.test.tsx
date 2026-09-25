import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { RelativeDay } from './RelativeDay'

it('skriver fast dato på serveren, uavhengig av serverens klokke', () => {
  const html = renderToString(<RelativeDay date={new Date(2026, 8, 24, 23, 50)} />)
  expect(html).toContain('24. september 2026')
})

it('viser relativ dag i nettleseren', () => {
  render(<RelativeDay date={new Date()} />)
  expect(screen.getByText('i dag')).toBeInTheDocument()
})
