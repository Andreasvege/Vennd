'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { planInput, type PlanInput } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, parseId, refreshAll, markSorted } from './shared'
import { fail, type ActionResult } from './result'

/** Planlegg noe: hvem, hva og når (klokkeslett er valgfritt). */
export async function createPlan(raw: PlanInput): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  const parsed = planInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { title, personIds, date, at, type } = parsed.data
  const unique = [...new Set(personIds)]

  try {
    await assertPersonsOwned(userId, unique)
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const plan = await prisma.plan.create({
    data: {
      userId,
      title,
      type: type ?? null,
      at: at ? new Date(at) : fromDateInput(date),
      hasTime: Boolean(at),
      persons: { create: unique.map((personId) => ({ personId })) },
    },
    select: { id: true },
  })
  await markSorted(userId, unique)
  refreshAll()
  return { ok: true, data: { id: plan.id } }
}

/** Flytt, gi nytt navn eller endre hvem som er med. Bare planer som ikke er gjort eller avlyst. */
export async function updatePlan(rawId: string, raw: PlanInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const parsed = planInput.safeParse(raw)
  if (!id || !parsed.success) return fail('invalid')
  const { title, personIds, date, at, type } = parsed.data
  const unique = [...new Set(personIds)]

  try {
    await assertPersonsOwned(userId, unique)
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.plan.updateMany({
        where: { id, userId, status: 'PLANNED' },
        data: { title, type: type ?? null, at: at ? new Date(at) : fromDateInput(date), hasTime: Boolean(at) },
      })
      if (count !== 1) throw new NotOwnedError()
      await tx.planPerson.deleteMany({ where: { planId: id } })
      await tx.planPerson.createMany({ data: unique.map((personId) => ({ planId: id, personId })) })
      await markSorted(userId, unique, tx)
    })
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }
  refreshAll()
  return { ok: true }
}

/** «Ble ikke noe av»: planen forsvinner fra I dag, men blir ikke en logg. */
export async function cancelPlan(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.plan.updateMany({
    where: { id, userId, status: 'PLANNED' },
    data: { status: 'CANCELLED' },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
