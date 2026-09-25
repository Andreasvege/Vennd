'use server'

import { prisma } from '@/lib/prisma'
import { placeNewPerson } from '@/domain/placement'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { personInput, personPatch, type PersonInput, type PersonPatch } from '@/server/schemas'
import { assertTagsOwned, fromDateInput, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

// Hovedtaggen må være en av personens tagger. Har personen tagger, men ingen
// gyldig hovedtagg, blir den første hovedtagg — da får de alltid en farge.
function resolvePrimary(tagIds: string[], primaryTagId: string | null | undefined): string | null {
  if (primaryTagId && tagIds.includes(primaryTagId)) return primaryTagId
  return tagIds[0] ?? null
}

export async function createPerson(raw: PersonInput): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  const parsed = personInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { tagIds = [], primaryTagId, birthday, ...fields } = parsed.data

  try {
    await assertTagsOwned(userId, tagIds)
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const existing = await prisma.person.findMany({
    where: { userId },
    select: { positionX: true, positionY: true },
  })
  const spot = placeNewPerson(existing.map((p) => ({ x: p.positionX, y: p.positionY })))

  const person = await prisma.person.create({
    data: {
      ...fields,
      userId,
      birthday: birthday ? fromDateInput(birthday) : null,
      positionX: spot.x,
      positionY: spot.y,
      primaryTagId: resolvePrimary(tagIds, primaryTagId),
      tags: { create: [...new Set(tagIds)].map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  })

  refreshAll()
  return { ok: true, data: { id: person.id } }
}

export async function updatePerson(id: string, raw: PersonPatch): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = personPatch.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { tagIds, primaryTagId, birthday, cadenceWeeks, ...fields } = parsed.data

  const owned = await prisma.person.findFirst({ where: { id, userId }, select: { id: true } })
  if (!owned) return fail('not-found')

  if (tagIds) {
    try {
      await assertTagsOwned(userId, tagIds)
    } catch (e) {
      if (e instanceof NotOwnedError) return fail('not-found')
      throw e
    }
  }

  await prisma.person.update({
    where: { id },
    data: {
      ...fields,
      ...(birthday !== undefined && { birthday: birthday ? fromDateInput(birthday) : null }),
      // Endrer du kadensen, er en gammel utsettelse ikke lenger relevant.
      ...(cadenceWeeks !== undefined && { cadenceWeeks, snoozedUntil: null }),
      ...(tagIds && {
        primaryTagId: resolvePrimary(tagIds, primaryTagId),
        tags: { deleteMany: {}, create: [...new Set(tagIds)].map((tagId) => ({ tagId })) },
      }),
    },
  })

  refreshAll()
  return { ok: true }
}

export async function deletePerson(id: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const { count } = await prisma.person.deleteMany({ where: { id, userId } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

/** Lagrer hvor du dro noen på kartet. Friskes ikke opp: klienten har allerede plassen. */
export async function movePerson(id: string, x: number, y: number): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!Number.isFinite(x) || !Number.isFinite(y)) return fail('invalid')
  const { count } = await prisma.person.updateMany({
    where: { id, userId },
    data: { positionX: x, positionY: y },
  })
  return count === 0 ? fail('not-found') : { ok: true }
}

/** «Ikke nå»: skyver kadens-påminnelsen noen uker fram. */
export async function snoozePerson(id: string, weeks = 1): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) return fail('invalid')
  const until = new Date()
  until.setDate(until.getDate() + weeks * 7)
  const { count } = await prisma.person.updateMany({ where: { id, userId }, data: { snoozedUntil: until } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
