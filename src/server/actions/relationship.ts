'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { relationshipInput, type RelationshipInput } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, refreshAll } from './shared'
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

export async function deleteRelationship(id: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const { count } = await prisma.relationship.deleteMany({
    where: { id, fromPerson: { userId }, toPerson: { userId } },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
