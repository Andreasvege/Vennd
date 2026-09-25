'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { nextTagColor } from '@/lib/palette'
import { requireUserId } from '@/server/session'
import { tagColor, tagName } from '@/server/schemas'
import { parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

type TagRow = { id: string; name: string; color: string }

const findByName = (userId: string, name: string) =>
  prisma.tag.findFirst({
    where: { userId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true, name: true, color: true },
  })

/**
 * Opprett en tagg — eller gi tilbake den som finnes, hvis navnet er det
 * samme med andre store og små bokstaver. «klatring» og «Klatring» er én tagg.
 */
export async function createTag(rawName: string): Promise<ActionResult<TagRow>> {
  const userId = await requireUserId()
  const name = tagName.safeParse(rawName)
  if (!name.success) return fail('invalid')

  const existing = await findByName(userId, name.data)
  if (existing) return { ok: true, data: existing }

  const used = await prisma.tag.findMany({ where: { userId }, select: { color: true } })
  try {
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
  } catch (e) {
    // To raske opprettelser av samme navn: den andre taper kappløpet mot
    // den unike indeksen. Da finnes taggen — gi tilbake den.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const winner = await findByName(userId, name.data)
      if (winner) return { ok: true, data: winner }
    }
    throw e
  }
}

export async function renameTag(rawId: string, rawName: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const name = tagName.safeParse(rawName)
  if (!id || !name.success) return fail('invalid')

  const clash = await prisma.tag.findFirst({
    where: { userId, id: { not: id }, name: { equals: name.data, mode: 'insensitive' } },
    select: { id: true },
  })
  if (clash) return fail('taken')

  const { count } = await prisma.tag.updateMany({ where: { id, userId }, data: { name: name.data } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function recolorTag(rawId: string, rawColor: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const color = tagColor.safeParse(rawColor)
  if (!id || !color.success) return fail('invalid')
  const { count } = await prisma.tag.updateMany({ where: { id, userId }, data: { color: color.data } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

/**
 * Slett en tagg. Var den noens hovedtagg, tar en av deres andre tagger
 * over, så de ikke mister fargen sin fordi en tagg forsvant.
 */
export async function deleteTag(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')

  const deleted = await prisma.$transaction(async (tx) => {
    const affected = await tx.person.findMany({
      where: { userId, primaryTagId: id },
      select: { id: true, tags: { where: { tagId: { not: id } }, select: { tagId: true }, take: 1 } },
    })
    const { count } = await tx.tag.deleteMany({ where: { id, userId } })
    for (const p of affected) {
      const next = p.tags[0]?.tagId
      if (next) await tx.person.update({ where: { id: p.id }, data: { primaryTagId: next } })
    }
    return count
  })

  if (deleted === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
