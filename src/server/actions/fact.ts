'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { factInput, type FactInput } from '@/server/schemas'
import { parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

export async function addFact(rawPersonId: string, raw: FactInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const personId = parseId(rawPersonId)
  const parsed = factInput.safeParse(raw)
  if (!personId || !parsed.success) return fail('invalid')

  const person = await prisma.person.findFirst({ where: { id: personId, userId }, select: { id: true } })
  if (!person) return fail('not-found')

  await prisma.fact.create({ data: { personId, ...parsed.data } })
  refreshAll()
  return { ok: true }
}

export async function updateFact(rawId: string, raw: FactInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const parsed = factInput.safeParse(raw)
  if (!id || !parsed.success) return fail('invalid')

  const { count } = await prisma.fact.updateMany({ where: { id, person: { userId } }, data: parsed.data })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function deleteFact(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.fact.deleteMany({ where: { id, person: { userId } } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
