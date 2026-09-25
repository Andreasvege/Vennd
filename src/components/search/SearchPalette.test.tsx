import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-aria-components'

const openComposer = vi.fn()
vi.mock('@/components/composer/ComposerProvider', () => ({ useComposer: () => openComposer }))

import { SearchPalette } from './SearchPalette'

const results = {
  terms: ['tur'],
  persons: [{ id: 'ingrid', name: 'Ingrid Aas', tint: 'ochre', where: null }],
  logs: [
    {
      id: 'l1',
      date: '2026-09-20T12:00:00.000Z',
      type: 'MET',
      participants: [{ id: 'ingrid', name: 'Ingrid Aas' }],
      snippet: [
        { text: 'Tur', match: true },
        { text: ' rundt Ekebergsletta', match: false },
      ],
    },
  ],
  threads: [],
  plans: [],
}

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({ ok: true, json: async () => results })
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

function setup() {
  const navigate = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <RouterProvider navigate={navigate}>
      <SearchPalette isOpen onOpenChange={onOpenChange} />
    </RouterProvider>,
  )
  return { navigate, onOpenChange, user: userEvent.setup() }
}

it('viser treffene gruppert, med treffordet uthevet', async () => {
  const { user } = setup()
  await user.type(screen.getByRole('searchbox'), 'ingrid tur')

  await waitFor(() => expect(screen.getByText('Personer')).toBeInTheDocument())
  expect(screen.getByText('Logger')).toBeInTheDocument()
  expect(screen.getByText('Tur').tagName).toBe('MARK')
  expect(fetchMock).toHaveBeenLastCalledWith('/api/sok?q=ingrid%20tur', expect.anything())
})

it('piltastene flytter i treffene mens fokus blir i feltet, og Enter åpner', async () => {
  const { user, navigate, onOpenChange } = setup()
  const input = screen.getByRole('searchbox')
  await user.type(input, 'ingrid tur')
  await waitFor(() => expect(screen.getByText('Logger')).toBeInTheDocument())

  const focused = () => document.querySelector('[role="menuitem"][data-focused]')?.textContent ?? ''
  // Første treff er aktivt med en gang, så Enter alene åpner det beste treffet.
  expect(focused()).toContain('Ingrid Aas')
  await user.keyboard('{ArrowDown}')
  expect(focused()).toContain('Ekebergsletta')
  expect(input).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(navigate).toHaveBeenCalledWith('/person/ingrid#logg-l1', undefined)
  expect(onOpenChange).toHaveBeenCalledWith(false)
})

it('tilbyr å skrive en logg når ingenting treffer', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...results, persons: [], logs: [] }) })
  const { user } = setup()
  await user.type(screen.getByRole('searchbox'), 'xyzzy')
  await waitFor(() => expect(screen.getByText('Ingen treff på «xyzzy»')).toBeInTheDocument())
  expect(screen.getByRole('menuitem', { name: 'Skriv en logg: «xyzzy»' })).toBeInTheDocument()
})
