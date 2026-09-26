'use server'

import { prisma } from '@/lib/prisma'
import { closenessPreset, missingPairs, newPairs } from '@/domain/sorting'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import {
  assignGroupInput,
  personIdList,
  sortPersonInput,
  type AssignGroupInput,
  type SortPersonInput,
} from '@/server/schemas'
import { assertPersonsOwned, assertTagsOwned, fromDateInput, markSorted, parseId, refreshAll } from './shared'
import { todayISO } from '@/domain/format'
import { fail, type ActionError, type ActionResult } from './result'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

// Relasjonene som finnes mellom disse personene, uansett retning.
async function existingPairs(tx: Tx, ids: string[]): Promise<[string, string][]> {
  const rows = await tx.relationship.findMany({
    where: { fromPersonId: { in: ids }, toPersonId: { in: ids } },
    select: { fromPersonId: true, toPersonId: true },
  })
  return rows.map((r) => [r.fromPersonId, r.toPersonId])
}

// Eierskapet sjekkes først; en person eller tagg som ikke er din, gir «finnes ikke».
async function owned<T>(
  check: () => Promise<void>,
  run: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: ActionError }> {
  try {
    await check()
    return { ok: true, data: await run() }
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }
}

/**
 * Ett kort i kortstokken: hvem de er for deg (type, dine ord, og for
 * romantiske: fasen), hvor ofte du vil holde kontakten, miljøene og hvem de
 * kjenner. Etterpå står personen på kartet.
 */
export async function sortPerson(raw: SortPersonInput): Promise<ActionResult<{ relationships: number }>> {
  const userId = await requireUserId()
  const parsed = sortPersonInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personId, type, relationLabel, cadenceWeeks, phase, tagIds, knows } = parsed.data
  const tags = [...new Set(tagIds)]
  const others = [...new Set(knows)].filter((id) => id !== personId)

  const result = await owned(
    async () => {
      await assertPersonsOwned(userId, [personId, ...others])
      await assertTagsOwned(userId, tags)
    },
    () =>
      prisma.$transaction(async (tx) => {
        await tx.person.update({
          where: { id: personId },
          data: {
            type,
            relationLabel: relationLabel || null,
            cadenceWeeks,
            snoozedUntil: null,
            primaryTagId: tags[0] ?? null,
            tags: { deleteMany: {}, create: tags.map((tagId) => ({ tagId })) },
          },
        })
        // Fasen legges til som i fasestripen på profilen, men bare når den er ny.
        if (type === 'ROMANTIC' && phase) {
          const last = await tx.romanticPhaseEntry.findFirst({ where: { personId }, orderBy: { at: 'desc' }, select: { phase: true } })
          if (last?.phase !== phase) await tx.romanticPhaseEntry.create({ data: { personId, phase, at: fromDateInput(todayISO()) } })
        }
        await markSorted(userId, [personId, ...others], tx)
        const have = await existingPairs(tx, [personId, ...others])
        const pairs = missingPairs([personId, ...others], have).filter(([a, b]) => a === personId || b === personId)
        await tx.relationship.createMany({
          data: pairs.map(([a, b]) => ({ fromPersonId: a, toPersonId: b, type: 'FRIEND' as const })),
        })
        return { relationships: pairs.length }
      }),
  )
  if (result.ok) refreshAll()
  return result
}

/**
 * Miljø for miljø: hvem som hører til (lista er fasit, så fjernede mister
 * taggen), og om de kjenner hverandre. Usorterte får plass og nærheten
 * «innimellom»; de kan justeres i kortstokken eller på profilen.
 */
export async function assignGroup(raw: AssignGroupInput): Promise<ActionResult<{ added: number; relationships: number }>> {
  const userId = await requireUserId()
  const parsed = assignGroupInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { tagId, connect } = parsed.data
  const members = [...new Set(parsed.data.personIds)]

  const result = await owned(
    async () => {
      await assertTagsOwned(userId, [tagId])
      await assertPersonsOwned(userId, members)
    },
    () =>
      prisma.$transaction(
        async (tx) => {
          const before = await tx.personTag.findMany({ where: { tagId }, select: { personId: true } })
          const had = new Set(before.map((b) => b.personId))
          const removed = [...had].filter((id) => !members.includes(id))
          const added = members.filter((id) => !had.has(id))

          await tx.personTag.deleteMany({ where: { tagId, personId: { in: removed } } })
          // Mistet de hovedtaggen, blir en av de andre taggene deres hovedtagg.
          // Samlet per ny hovedtagg, så mange fjernede ikke gir mange rundturer.
          const rest = await tx.personTag.findMany({ where: { personId: { in: removed } }, select: { personId: true, tagId: true } })
          const nextPrimary = new Map<string | null, string[]>()
          for (const personId of removed) {
            const next = rest.find((r) => r.personId === personId)?.tagId ?? null
            nextPrimary.set(next, [...(nextPrimary.get(next) ?? []), personId])
          }
          for (const [next, ids] of nextPrimary) {
            await tx.person.updateMany({ where: { id: { in: ids }, userId, primaryTagId: tagId }, data: { primaryTagId: next } })
          }
          await tx.personTag.createMany({ data: added.map((personId) => ({ personId, tagId })), skipDuplicates: true })
          await tx.person.updateMany({ where: { id: { in: members }, userId, primaryTagId: null }, data: { primaryTagId: tagId } })

          const { type, cadenceWeeks } = closenessPreset('sometimes')
          await tx.person.updateMany({
            where: { id: { in: members }, userId, sortedAt: null },
            data: { type, cadenceWeeks, sortedAt: new Date() },
          })

          const have = await existingPairs(tx, members)
          const pairs =
            connect === 'all'
              ? missingPairs(members, have)
              : connect === 'pairs'
                ? newPairs((parsed.data.pairs ?? []).filter(([x, y]) => members.includes(x) && members.includes(y)), have)
                : []
          await tx.relationship.createMany({
            data: pairs.map(([a, b]) => ({ fromPersonId: a, toPersonId: b, type: 'FRIEND' as const })),
          })
          return { added: added.length, relationships: pairs.length }
        },
        { timeout: 60_000 },
      ),
  )
  if (result.ok) refreshAll()
  return result
}

/** «Ikke i kartet»: skjult overalt, men importen kjenner dem igjen. */
export async function archivePersons(raw: string[]): Promise<ActionResult<{ count: number }>> {
  const userId = await requireUserId()
  const parsed = personIdList.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { count } = await prisma.person.updateMany({
    where: { id: { in: parsed.data }, userId, archivedAt: null },
    data: { archivedAt: new Date() },
  })
  refreshAll()
  return { ok: true, data: { count } }
}

/** Tilbake fra «ikke i kartet», til Venter-bunken. */
export async function restorePerson(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.person.updateMany({ where: { id, userId }, data: { archivedAt: null, sortedAt: null } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
