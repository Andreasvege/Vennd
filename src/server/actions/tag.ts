'use server'

import { prisma } from '@/lib/prisma'
import { nextTagColor } from '@/lib/palette'
import { requireUserId } from '@/server/session'
import { tagColor, tagName } from '@/server/schemas'
import { refreshAll } from './shared'
import { fail, type ActionResult } from './result'

/**
 * Opprett en tagg — eller gi tilbake den som finnes, hvis navnet er det
 * samme med andre store og små bokstaver. «klatring» og «Klatring» er én tagg.
 */
export async function createTag(rawName: string): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  const userId = await requireUserId()
  const name = tagName.safeParse(rawName)
  if (!name.success) return fail('invalid')

  const existing = await prisma.tag.findFirst({
    where: { userId, name: { equals: name.data, mode: 'insensitive' } },
    select: { id: true, name: true, color: true },
  })
  if (existing) return { ok: true, data: existing }

  const used = await prisma.tag.findMany({ where: { userId }, select: { color: true } })
  const tag = await prisma.tag.create({
    data: {
      userId,
      name: name.data,
      color: nextTagColor(used.map((t) => t.color)),
      sortOrder: used.length,
    },
    select: { id: true, name: true, color: true },
  })
  refreshAll()
  return { ok: true, data: tag }
}

export async function renameTag(id: string, rawName: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const name = tagName.safeParse(rawName)
  if (!name.success) return fail('invalid')

  const clash = await prisma.tag.findFirst({
    where: { userId, id: { not: id }, name: { equals: name.data, mode: 'insensitive' } },
    select: { id: true },
  })
  if (clash) return fail('invalid')

  const { count } = await prisma.tag.updateMany({ where: { id, userId }, data: { name: name.data } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function recolorTag(id: string, rawColor: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const color = tagColor.safeParse(rawColor)
  if (!color.success) return fail('invalid')
  const { count } = await prisma.tag.updateMany({ where: { id, userId }, data: { color: color.data } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const { count } = await prisma.tag.deleteMany({ where: { id, userId } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
