'use server'

import { prisma } from '@/lib/prisma'
import { placeNewPerson } from '@/domain/placement'
import { requireUserId } from '@/server/session'
import { removeBlob } from '@/server/blob'
import { NotOwnedError } from '@/server/ownership'
import { personInput, personPatch, type PersonInput, type PersonPatch } from '@/server/schemas'
import { revalidatePath } from 'next/cache'
import { assertTagsOwned, fromDateInput, parseId, refreshAll } from './shared'
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

export async function updatePerson(rawId: string, raw: PersonPatch): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const parsed = personPatch.safeParse(raw)
  if (!id || !parsed.success) return fail('invalid')
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

/**
 * Slett en person, og det som bare handlet om dem: logger og tråder der de
 * var den eneste. En middag med Ingrid og Martin blir stående når Martin
 * slettes — den handler fortsatt om Ingrid.
 */
export async function deletePerson(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')

  const photo = await prisma.person.findFirst({ where: { id, userId }, select: { photoUrl: true } })
  const onlyThem = { every: { personId: id }, some: { personId: id } }
  const [, , deleted] = await prisma.$transaction([
    prisma.logEntry.deleteMany({ where: { userId, participants: onlyThem } }),
    prisma.thread.deleteMany({ where: { userId, persons: onlyThem } }),
    prisma.person.deleteMany({ where: { id, userId } }),
  ])
  if (deleted.count === 0) return fail('not-found')
  await removeBlob(photo?.photoUrl)

  // Bare forsiden og innstillingene: å friske opp ruta vi står på ville
  // rendret en profil som ikke finnes lenger (404) før klienten navigerer.
  revalidatePath('/')
  revalidatePath('/settings')
  return { ok: true }
}

/**
 * Lagrer hvor du dro noen på kartet. Friskes opp: kartet regner ut plassene
 * på nytt fra dataene når du bytter syn eller filter, og da må den nye
 * plassen være med — ellers glir personen tilbake dit den sto.
 */
export async function movePerson(rawId: string, x: number, y: number): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id || typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return fail('invalid')
  }
  const { count } = await prisma.person.updateMany({
    where: { id, userId },
    data: { positionX: x, positionY: y },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

/** «Ikke nå»: skyver kadens-påminnelsen noen uker fram. */
export async function snoozePerson(rawId: string, weeks = 1): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id || !Number.isInteger(weeks) || weeks < 1 || weeks > 52) return fail('invalid')
  const until = new Date()
  until.setDate(until.getDate() + weeks * 7)
  const { count } = await prisma.person.updateMany({ where: { id, userId }, data: { snoozedUntil: until } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
