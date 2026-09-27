'use server'

import { prisma } from '@/lib/prisma'
import { nextTagColor } from '@/lib/palette'
import { placeNewPerson } from '@/domain/placement'
import { fold } from '@/domain/search'
import { resolveTell, type TellProposal } from '@/domain/tell'
import { askTell } from '@/server/claude/tell'
import { isClaudeEnabled } from '@/server/claude/client'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { applyTellInput, tellInput, type ApplyTellInput } from '@/server/schemas'
import { t } from '@/i18n'
import { assertPersonsOwned, assertTagsOwned, fromDateInput, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

const IMPORTED: string[] = [t.import.phoneLabel, t.import.emailLabel]

/**
 * «Fortell om Ingrid»: Claude leser det du skrev og foreslår hva det betyr
 * for kartet. Ingenting lagres her; du velger selv hva som skal inn. Ett
 * kall per trykk, aldri automatisk.
 */
export async function tellAbout(raw: { personId: string; text: string }): Promise<ActionResult<{ proposals: TellProposal[] }>> {
  const userId = await requireUserId()
  const parsed = tellInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  if (!isClaudeEnabled()) return fail('failed')
  const { personId, text } = parsed.data

  const [subject, persons, tags, relationships] = await Promise.all([
    prisma.person.findFirst({
      where: { id: personId, userId },
      select: {
        id: true,
        name: true,
        relationLabel: true,
        birthday: true,
        tags: { select: { tagId: true } },
        facts: { select: { label: true, value: true } },
      },
    }),
    prisma.person.findMany({ where: { userId, archivedAt: null }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId }, toPerson: { userId } },
      select: { fromPersonId: true, toPersonId: true },
    }),
  ])
  if (!subject) return fail('not-found')

  const ctx = {
    subject: {
      id: subject.id,
      name: subject.name,
      relationLabel: subject.relationLabel,
      hasBirthday: subject.birthday !== null,
      tagIds: subject.tags.map((x) => x.tagId),
      facts: subject.facts.filter((f) => !IMPORTED.includes(f.label)),
    },
    persons,
    tags,
    pairs: relationships.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]),
  }
  try {
    const out = await askTell(ctx, text)
    return { ok: true, data: { proposals: out ? resolveTell(ctx, out) : [] } }
  } catch (e) {
    console.error('[claude] fortell feilet', e)
    return fail('failed')
  }
}

/**
 * Legger inn forslagene du valgte. Nye navn blir personer på kartet (ved
 * siden av den de kjenner), nye miljøer blir tagger. Alt i én transaksjon.
 */
export async function applyTell(raw: ApplyTellInput): Promise<ActionResult<{ added: number }>> {
  const userId = await requireUserId()
  const parsed = applyTellInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personId, proposals } = parsed.data

  const personIds = new Set<string>([personId])
  const tagIds = new Set<string>()
  for (const p of proposals) {
    if (p.kind === 'RELATION') [p.a, p.b].forEach((r) => r.id && personIds.add(r.id))
    else if (p.kind === 'THREAD') p.personIds.forEach((id) => personIds.add(id))
    else if (p.kind === 'GROUP' && p.tagId) tagIds.add(p.tagId)
    if ('personId' in p) personIds.add(p.personId)
  }
  try {
    await assertPersonsOwned(userId, [...personIds])
    await assertTagsOwned(userId, [...tagIds])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const added = await prisma.$transaction(async (tx) => {
    let count = 0
    // Nye navn: én person per navn, selv om navnet står i flere forslag.
    const created = new Map<string, string>()
    const positions = (await tx.person.findMany({ where: { userId }, select: { positionX: true, positionY: true } })).map((p) => ({
      x: p.positionX,
      y: p.positionY,
    }))
    const resolve = async (ref: { id: string | null; name: string }) => {
      if (ref.id) return ref.id
      const key = fold(ref.name)
      const existing = created.get(key)
      if (existing) return existing
      const spot = placeNewPerson(positions)
      positions.push(spot)
      const person = await tx.person.create({
        data: { userId, name: ref.name, type: 'FRIEND', positionX: spot.x, positionY: spot.y, sortedAt: new Date() },
        select: { id: true },
      })
      created.set(key, person.id)
      return person.id
    }

    for (const p of proposals) {
      if (p.kind === 'LABEL') {
        await tx.person.update({ where: { id: p.personId }, data: { relationLabel: p.label } })
      } else if (p.kind === 'BIRTHDAY') {
        await tx.person.update({ where: { id: p.personId }, data: { birthday: fromDateInput(p.date) } })
      } else if (p.kind === 'GROUP') {
        const tag =
          (p.tagId && { id: p.tagId }) ||
          (await tx.tag.findFirst({ where: { userId, name: { equals: p.name, mode: 'insensitive' } }, select: { id: true } })) ||
          (await (async () => {
            const used = await tx.tag.findMany({ where: { userId }, select: { color: true } })
            return tx.tag.create({
              data: { userId, name: p.name, color: nextTagColor(used.map((x) => x.color)), sortOrder: used.length },
              select: { id: true },
            })
          })())
        await tx.personTag.createMany({ data: [{ personId: p.personId, tagId: tag.id }], skipDuplicates: true })
        await tx.person.updateMany({ where: { id: p.personId, userId, primaryTagId: null }, data: { primaryTagId: tag.id } })
      } else if (p.kind === 'FACT') {
        await tx.fact.create({ data: { personId: p.personId, label: p.label, value: p.value } })
      } else if (p.kind === 'RELATION') {
        const a = await resolve(p.a)
        const b = await resolve(p.b)
        if (a === b) continue
        const exists = await tx.relationship.findFirst({
          where: { OR: [{ fromPersonId: a, toPersonId: b }, { fromPersonId: b, toPersonId: a }] },
          select: { id: true },
        })
        if (exists) continue
        await tx.relationship.create({ data: { fromPersonId: a, toPersonId: b, type: p.type, label: p.label } })
      } else {
        await tx.thread.create({
          data: {
            userId,
            title: p.title,
            dueDate: p.dueDate ? fromDateInput(p.dueDate) : null,
            persons: { create: p.personIds.map((id) => ({ personId: id })) },
          },
        })
      }
      count++
    }
    return count
  })
  refreshAll()
  return { ok: true, data: { added } }
}
