'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import {
  connectedPersonInput,
  relationshipInput,
  relationshipPatch,
  type ConnectedPersonInput,
  type RelationshipInput,
  type RelationshipPatch,
} from '@/server/schemas'
import { placeNewPerson } from '@/domain/placement'
import { proximitiesAfterNew, type Proximity } from '@/server/queries/proximity'
import { assertPersonsOwned, fromDateInput, parseId, refreshAll, markSorted } from './shared'
import { fail, type ActionResult } from './result'

export async function createRelationship(
  raw: RelationshipInput,
): Promise<ActionResult<{ id: string; proximities: Proximity[] }>> {
  const userId = await requireUserId()
  const parsed = relationshipInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { fromPersonId, toPersonId, type, label, since, until } = parsed.data

  try {
    await assertPersonsOwned(userId, [fromPersonId, toPersonId])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const rel = await prisma.relationship.create({
    data: {
      fromPersonId,
      toPersonId,
      type,
      label: label || null,
      since: since ? fromDateInput(since) : null,
      until: until ? fromDateInput(until) : null,
    },
    select: { id: true },
  })
  await markSorted(userId, [fromPersonId, toPersonId])
  // Gjorde dette verden mindre? Klienten sier fra om det.
  const proximities = await proximitiesAfterNew(userId, rel.id)
  refreshAll()
  return { ok: true, data: { id: rel.id, proximities } }
}

/**
 * En ny person som kjenner en du allerede har: dra fra personen ut i
 * tomrommet på kartet. Personen havner på kartet med en gang (der du slapp,
 * i Nettverk), i samme miljø om du vil, og koblet til den du dro fra.
 */
export async function createConnectedPerson(
  raw: ConnectedPersonInput,
): Promise<ActionResult<{ id: string; proximities: Proximity[] }>> {
  const userId = await requireUserId()
  const parsed = connectedPersonInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { name, knownPersonId, type, label, sameGroup, position } = parsed.data

  const known = await prisma.person.findFirst({
    where: { id: knownPersonId, userId },
    select: { primaryTagId: true },
  })
  if (!known) return fail('not-found')

  const spot =
    position ??
    placeNewPerson(
      (await prisma.person.findMany({ where: { userId }, select: { positionX: true, positionY: true } })).map((p) => ({
        x: p.positionX,
        y: p.positionY,
      })),
    )
  const tagId = sameGroup ? known.primaryTagId : null

  const rel = await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        userId,
        name,
        // Hva de er for deg, vet vi ikke ennå; en venn er et trygt utgangspunkt.
        type: 'FRIEND',
        positionX: Math.round(spot.x),
        positionY: Math.round(spot.y),
        sortedAt: new Date(),
        primaryTagId: tagId,
        tags: tagId ? { create: [{ tagId }] } : undefined,
      },
      select: { id: true },
    })
    return tx.relationship.create({
      data: { fromPersonId: knownPersonId, toPersonId: person.id, type, label: label || null },
      select: { id: true, toPersonId: true },
    })
  })
  const proximities = await proximitiesAfterNew(userId, rel.id)
  refreshAll()
  return { ok: true, data: { id: rel.toPersonId, proximities } }
}

/** Endre type, etikett eller tid. `until` satt til i dag avslutter relasjonen. */
export async function updateRelationship(rawId: string, raw: RelationshipPatch): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const parsed = relationshipPatch.safeParse(raw)
  if (!id || !parsed.success) return fail('invalid')
  const { since, until, label, type } = parsed.data

  const { count } = await prisma.relationship.updateMany({
    where: { id, fromPerson: { userId }, toPerson: { userId } },
    data: {
      ...(type !== undefined && { type }),
      ...(label !== undefined && { label: label || null }),
      ...(since !== undefined && { since: since ? fromDateInput(since) : null }),
      ...(until !== undefined && { until: until ? fromDateInput(until) : null }),
    },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function deleteRelationship(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.relationship.deleteMany({
    where: { id, fromPerson: { userId }, toPerson: { userId } },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
