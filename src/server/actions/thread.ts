'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { threadCloseInput, type ThreadCloseInput } from '@/server/schemas'
import { refreshAll } from './shared'
import { fail, type ActionResult } from './result'

/** Lukk en tråd, eventuelt med hvordan det gikk: «Fikk jobben». */
export async function closeThread(raw: ThreadCloseInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = threadCloseInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { threadId, resolution } = parsed.data

  const { count } = await prisma.thread.updateMany({
    where: { id: threadId, userId, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date(), resolution: resolution || null },
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
