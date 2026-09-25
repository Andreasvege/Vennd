import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const uploadPhoto = vi.fn()
const removePhoto = vi.fn()
vi.mock('@/server/actions/photo', () => ({
  uploadPhoto: (...a: unknown[]) => uploadPhoto(...a),
  removePhoto: (...a: unknown[]) => removePhoto(...a),
}))
vi.mock('./resizePhoto', () => ({ resizePhoto: async () => new Blob(['x'], { type: 'image/webp' }) }))

import { PhotoField } from './PhotoField'

const URL_NEW = 'https://abc.public.blob.vercel-storage.com/people/u/p-1.webp'

beforeEach(() => {
  uploadPhoto.mockReset()
  removePhoto.mockReset()
})

it('skalerer ned, laster opp som WebP og viser det nye bildet', async () => {
  uploadPhoto.mockResolvedValue({ ok: true, data: { url: URL_NEW } })
  const user = userEvent.setup()
  const { container } = render(<PhotoField personId="p" name="Ingrid Aas" tint="ochre" photoUrl={null} />)

  const input = container.querySelector('input[type=file]') as HTMLInputElement
  await user.upload(input, new File(['bilde'], 'ingrid.jpg', { type: 'image/jpeg' }))

  await waitFor(() => expect(uploadPhoto).toHaveBeenCalled())
  const [id, form] = uploadPhoto.mock.calls[0] as [string, FormData]
  expect(id).toBe('p')
  expect((form.get('photo') as File).type).toBe('image/webp')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Fjern' })).toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Bytt bilde' })).toBeInTheDocument()
})

it('fjerner bildet', async () => {
  removePhoto.mockResolvedValue({ ok: true })
  const user = userEvent.setup()
  render(<PhotoField personId="p" name="Ingrid Aas" tint="ochre" photoUrl={URL_NEW} />)
  await user.click(screen.getByRole('button', { name: 'Fjern' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Legg til bilde' })).toBeInTheDocument())
  expect(removePhoto).toHaveBeenCalledWith('p')
})
