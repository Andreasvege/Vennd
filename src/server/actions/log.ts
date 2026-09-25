'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { logInput, type LogInput } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

export async function createLog(raw: LogInput): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  const parsed = logInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personIds, date, type, body } = parsed.data
  const unique = [...new Set(personIds)]

  try {
    await assertPersonsOwned(userId, unique)
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const entry = await prisma.logEntry.create({
    data: {
      userId,
      date: fromDateInput(date),
      type: type ?? null,
      body: body?.trim() || null,
      participants: { create: unique.map((personId) => ({ personId })) },
    },
    select: { id: true },
  })
  refreshAll()
  return { ok: true, data: { id: entry.id } }
}

export async function deleteLog(id: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const { count } = await prisma.logEntry.deleteMany({ where: { id, userId } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
