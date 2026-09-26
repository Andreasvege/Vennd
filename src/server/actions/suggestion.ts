'use server'

import { prisma } from '@/lib/prisma'
import { placeNewPerson } from '@/domain/placement'
import { fold } from '@/domain/search'
import { requireUserId } from '@/server/session'
import { assertAllOwned, NotOwnedError } from '@/server/ownership'
import { suggestionPayload } from '@/server/schemas'
import { fromDateInput, parseId, refreshAll, markSorted } from './shared'
import { fail, type ActionResult } from './result'

type Kind = keyof typeof suggestionPayload

/**
 * Godta et forslag: gjør endringen og merk forslaget som godtatt, i én
 * transaksjon. Statusvakten gjør at to raske trykk gir én tråd, ikke to.
 */
export async function acceptSuggestion(rawId: string): Promise<ActionResult<{ kind: Kind }>> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')

  const suggestion = await prisma.suggestion.findFirst({
    where: { id, userId, status: 'PENDING' },
    select: { kind: true, payload: true, logEntryId: true },
  })
  if (!suggestion) return fail('not-found')
  const { kind, logEntryId } = suggestion

  try {
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.suggestion.updateMany({ where: { id, userId, status: 'PENDING' }, data: { status: 'ACCEPTED' } })
      if (count !== 1) throw new NotOwnedError()

      const owned = async (ids: string[]) =>
        assertAllOwned(ids, await tx.person.findMany({ where: { id: { in: ids }, userId }, select: { id: true } }))

      switch (kind) {
        case 'THREAD': {
          const p = suggestionPayload.THREAD.parse(suggestion.payload)
          await owned(p.personIds)
          await tx.thread.create({
            data: {
              userId,
              title: p.title,
              dueDate: p.dueDate ? fromDateInput(p.dueDate) : null,
              openedById: logEntryId,
              persons: { create: [...new Set(p.personIds)].map((personId) => ({ personId })) },
            },
          })
          break
        }
        case 'FACT': {
          const p = suggestionPayload.FACT.parse(suggestion.payload)
          await owned([p.personId])
          const existing = await tx.fact.findMany({ where: { personId: p.personId }, select: { label: true, value: true } })
          if (!existing.some((f) => fold(f.label) === fold(p.label) && fold(f.value) === fold(p.value))) {
            await tx.fact.create({ data: p })
          }
          break
        }
        case 'PARTICIPANT': {
          const p = suggestionPayload.PARTICIPANT.parse(suggestion.payload)
          await owned([p.personId])
          await tx.logParticipant.createMany({ data: [{ logEntryId, personId: p.personId }], skipDuplicates: true })
          await markSorted(userId, [p.personId], tx)
          break
        }
        case 'PERSON': {
          const p = suggestionPayload.PERSON.parse(suggestion.payload)
          const positions = await tx.person.findMany({ where: { userId }, select: { positionX: true, positionY: true } })
          const spot = placeNewPerson(positions.map((q) => ({ x: q.positionX, y: q.positionY })))
          // Personen var med i det loggen forteller om, så hun blir deltaker med en gang.
          await tx.person.create({
            data: {
              userId,
              name: p.name,
              sortedAt: new Date(),
              positionX: spot.x,
              positionY: spot.y,
              participations: { create: { logEntryId } },
            },
          })
          break
        }
      }
    })
  } catch (e) {
    // Ugyldig innhold (zod) eller noe som ikke er ditt: forslaget kan ikke brukes.
    if (e instanceof NotOwnedError || (e instanceof Error && e.name === 'ZodError')) return fail('not-found')
    throw e
  }

  refreshAll()
  return { ok: true, data: { kind } }
}

/** Avvis et forslag. Det kommer ikke tilbake. */
export async function dismissSuggestion(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.suggestion.updateMany({ where: { id, userId, status: 'PENDING' }, data: { status: 'DISMISSED' } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
