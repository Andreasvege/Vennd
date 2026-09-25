import 'server-only'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { assertAllOwned } from '@/server/ownership'
import { id as idSchema } from '@/server/schemas'

/**
 * Argumentene til en server action kommer fra nettverket og kan være hva
 * som helst — også objekter som Prisma ville tolket som filtre
 * ({ not: '' }). Alle id-er går derfor gjennom skjemaet først.
 */
export function parseId(raw: unknown): string | null {
  const parsed = idSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

/** Alle sider leser fra de samme dataene, så en endring friskes opp overalt. */
export function refreshAll() {
  revalidatePath('/', 'layout')
}

/** Kast NotOwnedError hvis noen av personene ikke er brukerens. */
export async function assertPersonsOwned(userId: string, ids: string[]) {
  const found = await prisma.person.findMany({ where: { id: { in: ids }, userId }, select: { id: true } })
  assertAllOwned(ids, found)
}

export async function assertTagsOwned(userId: string, ids: string[]) {
  const found = await prisma.tag.findMany({ where: { id: { in: ids }, userId }, select: { id: true } })
  assertAllOwned(ids, found)
}

/**
 * En dato fra et datofelt (YYYY-MM-DD) lagres midt på dagen i UTC. Da er
 * det samme kalenderdag i alle tidssoner fra UTC−11 til UTC+11, og en logg
 * fra «i dag» blir ikke til «i går» når den leses i Norge.
 */
export function fromDateInput(date: string): Date {
  return new Date(`${date}T12:00:00.000Z`)
}
