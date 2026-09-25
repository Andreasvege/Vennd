'use server'

import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { isPhotosEnabled, removeBlob } from '@/server/blob'
import { parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']
// Nettleseren skalerer ned til 512 px før opplasting; dette er et tak, ikke et mål.
const MAX_BYTES = 2 * 1024 * 1024

/** Et bilde av en person. Det gamle slettes når det nye er på plass. */
export async function uploadPhoto(rawId: string, form: FormData): Promise<ActionResult<{ url: string }>> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const file = form.get('photo')
  if (!id || !(file instanceof File) || !TYPES.includes(file.type) || file.size === 0 || file.size > MAX_BYTES) {
    return fail('invalid')
  }
  if (!isPhotosEnabled()) return fail('failed')

  const person = await prisma.person.findFirst({ where: { id, userId }, select: { photoUrl: true } })
  if (!person) return fail('not-found')

  const blob = await put(`people/${userId}/${id}.webp`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })
  await prisma.person.updateMany({ where: { id, userId }, data: { photoUrl: blob.url } })
  await removeBlob(person.photoUrl)

  refreshAll()
  return { ok: true, data: { url: blob.url } }
}

export async function removePhoto(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const person = await prisma.person.findFirst({ where: { id, userId }, select: { photoUrl: true } })
  if (!person) return fail('not-found')
  await prisma.person.updateMany({ where: { id, userId }, data: { photoUrl: null } })
  await removeBlob(person.photoUrl)
  refreshAll()
  return { ok: true }
}
