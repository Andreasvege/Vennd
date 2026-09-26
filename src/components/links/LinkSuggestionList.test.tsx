import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const acceptLinks = vi.fn()
const dismissLink = vi.fn()
vi.mock('@/server/actions/links', () => ({
  acceptLinks: (...a: unknown[]) => acceptLinks(...a),
  dismissLink: (...a: unknown[]) => dismissLink(...a),
}))

import { LinkSuggestionList } from './LinkSuggestionList'
import { ToastProvider } from '@/components/toast/ToastProvider'
import type { LinkSuggestionItem } from '@/server/queries/links'

const p = (id: string, name: string) => ({ id, name, tint: 'stone' as const, photoUrl: null })
const items: LinkSuggestionItem[] = [
  { a: p('h', 'Håvard Vege'), b: p('s', 'Selma Vege'), type: 'FAMILY', label: 'søsken', reason: 'Begge er søskenbarn av Nora og heter Vege.', fromClaude: true, shared: ['Nora'], sharedCount: 1, surname: 'Vege' },
  { a: p('h', 'Håvard Vege'), b: p('a', 'August Vege'), type: 'FAMILY', label: null, reason: null, fromClaude: false, shared: ['Nora'], sharedCount: 1, surname: 'Vege' },
]

beforeEach(() => {
  acceptLinks.mockReset().mockResolvedValue({ ok: true, data: { created: 2 } })
  dismissLink.mockReset().mockResolvedValue({ ok: true })
})

const setup = (props: Partial<Parameters<typeof LinkSuggestionList>[0]> = {}) => {
  render(
    <ToastProvider>
      <LinkSuggestionList items={items} {...props} />
    </ToastProvider>,
  )
  return userEvent.setup()
}

it('viser Claudes etikett og begrunnelse, og regelens begrunnelse med etternavn', () => {
  setup()
  expect(screen.getByText('Begge er søskenbarn av Nora og heter Vege.')).toBeInTheDocument()
  expect(screen.getByText(/· søsken/)).toBeInTheDocument()
  expect(screen.getByText('Begge kjenner Nora, og heter Vege')).toBeInTheDocument()
})

it('på profilen står bare den andre personen', () => {
  setup({ personId: 'h' })
  expect(screen.getByText('Selma Vege')).toBeInTheDocument()
  expect(screen.queryByText(/Håvard Vege og/)).not.toBeInTheDocument()
})

it('avviser ett forslag, og viser det igjen hvis det feilet', async () => {
  dismissLink.mockResolvedValue({ ok: false, error: 'failed' })
  const user = setup()
  await user.click(screen.getByRole('button', { name: 'Ikke foreslå Håvard Vege og August Vege' }))
  expect(dismissLink).toHaveBeenCalledWith(['h', 'a'])
  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  expect(screen.getByText('Begge kjenner Nora, og heter Vege')).toBeInTheDocument()
})
