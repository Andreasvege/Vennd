'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { assertAllOwned, NotOwnedError } from '@/server/ownership'
import { logInput, type LogInput } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

export type LogSaved = { id: string; closed: number; opened: number }

/**
 * Lagre en logg — og i samme slengen lukke trådene den følger opp og åpne
 * nye. Alt i én transaksjon: enten står hele samtalen, eller ingenting.
 */
export async function createLog(raw: LogInput): Promise<ActionResult<LogSaved>> {
  const userId = await requireUserId()
  const parsed = logInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personIds, date, type, body, closeThreads = [], newThreads = [], planId } = parsed.data
  const unique = [...new Set(personIds)]
  const closeIds = [...new Set(closeThreads.map((c) => c.id))]

  try {
    await assertPersonsOwned(userId, unique)
    const open = await prisma.thread.findMany({
      where: { id: { in: closeIds }, userId, status: 'OPEN' },
      select: { id: true },
    })
    assertAllOwned(closeIds, open)
    if (planId) {
      const plan = await prisma.plan.findFirst({ where: { id: planId, userId, status: 'PLANNED' }, select: { id: true } })
      if (!plan) throw new NotOwnedError()
    }
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const resolutions = new Map(closeThreads.map((c) => [c.id, c.resolution?.trim() || null]))
  const now = new Date()

  let entry: { id: string }
  try {
    entry = await prisma.$transaction(async (tx) => {
    const created = await tx.logEntry.create({
      data: {
        userId,
        date: fromDateInput(date),
        type: type ?? null,
        body: body?.trim() || null,
        participants: { create: unique.map((personId) => ({ personId })) },
      },
      select: { id: true },
    })
    for (const threadId of closeIds) {
      // Vakten gjentas her: ble tråden lukket et annet sted i mellomtiden,
      // rulles hele loggen tilbake i stedet for å skrive over den.
      const { count } = await tx.thread.updateMany({
        where: { id: threadId, userId, status: 'OPEN' },
        data: { status: 'CLOSED', closedAt: now, closedById: created.id, resolution: resolutions.get(threadId) },
      })
      if (count !== 1) throw new NotOwnedError()
    }
    if (planId) {
      // Planen er fulgt opp: loggen er det som faktisk skjedde.
      const { count } = await tx.plan.updateMany({
        where: { id: planId, userId, status: 'PLANNED' },
        data: { status: 'DONE', logEntryId: created.id },
      })
      if (count !== 1) throw new NotOwnedError()
    }
    for (const th of newThreads) {
      await tx.thread.create({
        data: {
          userId,
          title: th.title,
          dueDate: th.dueDate ? fromDateInput(th.dueDate) : null,
          openedById: created.id,
          persons: { create: [...new Set(th.personIds)].map((personId) => ({ personId })) },
        },
      })
    }
    return created
    })
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  refreshAll()
  return { ok: true, data: { id: entry.id, closed: closeIds.length, opened: newThreads.length } }
}

export async function deleteLog(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.logEntry.deleteMany({ where: { id, userId } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
