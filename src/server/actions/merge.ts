'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { removeBlob } from '@/server/blob'
import { linkPair, mergeInput, type MergeInput } from '@/server/schemas'
import { assertPersonsOwned, refreshAll } from './shared'
import { NotOwnedError } from '@/server/ownership'
import { fail, type ActionResult } from './result'

const ordered = ([x, y]: [string, string]): [string, string] => (x < y ? [x, y] : [y, x])

/**
 * Slå sammen to personer som er den samme. Alt flyttes til den som blir
 * stående: logger, relasjoner, tråder, planer, tagger, fakta og faser. Der
 * begge hadde det samme (samme logg, samme relasjon), blir det ett. Tomme
 * felt fylles fra den andre; notater slås sammen.
 */
export async function mergePersons(raw: MergeInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = mergeInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { keepId, dropId, name } = parsed.data

  const [keep, drop] = await Promise.all([
    prisma.person.findFirst({ where: { id: keepId, userId } }),
    prisma.person.findFirst({ where: { id: dropId, userId } }),
  ])
  if (!keep || !drop) return fail('not-found')

  await prisma.$transaction(
    async (tx) => {
      // Koblingstabeller: flytt, men ikke der den som blir stående alt er med.
      const logs = (await tx.logParticipant.findMany({ where: { personId: keepId }, select: { logEntryId: true } })).map((r) => r.logEntryId)
      await tx.logParticipant.deleteMany({ where: { personId: dropId, logEntryId: { in: logs } } })
      await tx.logParticipant.updateMany({ where: { personId: dropId }, data: { personId: keepId } })

      const threads = (await tx.threadPerson.findMany({ where: { personId: keepId }, select: { threadId: true } })).map((r) => r.threadId)
      await tx.threadPerson.deleteMany({ where: { personId: dropId, threadId: { in: threads } } })
      await tx.threadPerson.updateMany({ where: { personId: dropId }, data: { personId: keepId } })

      const plans = (await tx.planPerson.findMany({ where: { personId: keepId }, select: { planId: true } })).map((r) => r.planId)
      await tx.planPerson.deleteMany({ where: { personId: dropId, planId: { in: plans } } })
      await tx.planPerson.updateMany({ where: { personId: dropId }, data: { personId: keepId } })

      const tags = (await tx.personTag.findMany({ where: { personId: keepId }, select: { tagId: true } })).map((r) => r.tagId)
      await tx.personTag.deleteMany({ where: { personId: dropId, tagId: { in: tags } } })
      await tx.personTag.updateMany({ where: { personId: dropId }, data: { personId: keepId } })

      // Relasjoner: en relasjon mellom de to forsvinner; en den andre også har, blir én.
      const rels = await tx.relationship.findMany({
        where: { OR: [{ fromPersonId: dropId }, { toPersonId: dropId }] },
        select: { id: true, fromPersonId: true, toPersonId: true },
      })
      const keepRels = await tx.relationship.findMany({
        where: { OR: [{ fromPersonId: keepId }, { toPersonId: keepId }] },
        select: { fromPersonId: true, toPersonId: true },
      })
      const keepOthers = new Set(keepRels.map((r) => (r.fromPersonId === keepId ? r.toPersonId : r.fromPersonId)))
      for (const r of rels) {
        const other = r.fromPersonId === dropId ? r.toPersonId : r.fromPersonId
        if (other === keepId || keepOthers.has(other)) {
          await tx.relationship.delete({ where: { id: r.id } })
        } else {
          await tx.relationship.update({
            where: { id: r.id },
            data: r.fromPersonId === dropId ? { fromPersonId: keepId } : { toPersonId: keepId },
          })
          keepOthers.add(other)
        }
      }

      // Fakta og faser: flytt, men ikke et faktum den som blir stående alt har.
      const keepFacts = await tx.fact.findMany({ where: { personId: keepId }, select: { label: true, value: true } })
      const dropFacts = await tx.fact.findMany({ where: { personId: dropId }, select: { id: true, label: true, value: true } })
      const dupes = dropFacts.filter((f) => keepFacts.some((k) => k.label === f.label && k.value === f.value)).map((f) => f.id)
      await tx.fact.deleteMany({ where: { id: { in: dupes } } })
      await tx.fact.updateMany({ where: { personId: dropId }, data: { personId: keepId } })
      await tx.romanticPhaseEntry.updateMany({ where: { personId: dropId }, data: { personId: keepId } })

      // Forslag om den som forsvinner, er ikke lenger gyldige.
      await tx.linkSuggestion.deleteMany({ where: { userId, OR: [{ aId: dropId }, { bId: dropId }] } })

      const notes = [keep.notes, drop.notes].filter((n): n is string => Boolean(n?.trim()))
      await tx.person.update({
        where: { id: keepId },
        data: {
          name,
          birthday: keep.birthday ?? drop.birthday,
          notes: [...new Set(notes)].join('\n\n') || null,
          photoUrl: keep.photoUrl ?? drop.photoUrl,
          relationLabel: keep.relationLabel ?? drop.relationLabel,
          primaryTagId: keep.primaryTagId ?? drop.primaryTagId,
          sortedAt: keep.sortedAt ?? drop.sortedAt,
          archivedAt: keep.archivedAt && drop.archivedAt ? keep.archivedAt : null,
        },
      })
      await tx.person.delete({ where: { id: dropId } })
    },
    { timeout: 60_000 },
  )
  // Et bilde bare den slettede hadde, er flyttet; hadde begge, er det andre til overs.
  if (keep.photoUrl && drop.photoUrl) await removeBlob(drop.photoUrl)

  refreshAll()
  return { ok: true }
}

/** «Ikke samme person»: paret foreslås ikke igjen. */
export async function markNotSame(raw: [string, string]): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = linkPair.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const [aId, bId] = ordered(parsed.data)
  try {
    await assertPersonsOwned(userId, [aId, bId])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }
  await prisma.notSamePerson.upsert({
    where: { userId_aId_bId: { userId, aId, bId } },
    create: { userId, aId, bId },
    update: {},
  })
  refreshAll()
  return { ok: true }
}
