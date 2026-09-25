'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { phaseInput, type PhaseInput } from '@/server/schemas'
import { fromDateInput, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

/** Registrer at dere gikk over i en ny fase. Bare for folk du har en romantisk relasjon til. */
export async function addPhase(raw: PhaseInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = phaseInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personId, phase, at } = parsed.data

  const person = await prisma.person.findFirst({
    where: { id: personId, userId, type: 'ROMANTIC' },
    select: { id: true },
  })
  if (!person) return fail('not-found')

  await prisma.romanticPhaseEntry.create({ data: { personId, phase, at: fromDateInput(at) } })
  refreshAll()
  return { ok: true }
}
