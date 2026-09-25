'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { relationshipInput, relationshipPatch, type RelationshipInput, type RelationshipPatch } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

export async function createRelationship(raw: RelationshipInput): Promise<ActionResult<{ id: string }>> {
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
  refreshAll()
  return { ok: true, data: { id: rel.id } }
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
