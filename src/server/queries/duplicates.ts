import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { findDuplicates } from '@/domain/duplicates'
import { notArchived } from './visibility'

/** Mulige duplikater, med det som skiller dem, så du ser hvilken som er «hoved». */
export async function getDuplicates(userId: string) {
  const [persons, notSame] = await Promise.all([
    prisma.person.findMany({
      where: { userId, ...notArchived },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        birthday: true,
        primaryTag: { select: { color: true, name: true } },
        _count: { select: { participations: true, relationsFrom: true, relationsTo: true, facts: true } },
      },
    }),
    prisma.notSamePerson.findMany({ where: { userId }, select: { aId: true, bId: true } }),
  ])
  const byId = new Map(persons.map((p) => [p.id, p]))
  const shape = (id: string) => {
    const p = byId.get(id)!
    return {
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      tint: personTint(p),
      group: p.primaryTag?.name ?? null,
      birthday: p.birthday,
      logs: p._count.participations,
      relations: p._count.relationsFrom + p._count.relationsTo,
      facts: p._count.facts,
    }
  }
  return findDuplicates(persons, new Set(notSame.map((n) => `${n.aId}|${n.bId}`))).map((d) => {
    const [a, b] = [shape(d.a), shape(d.b)]
    // Den med mest historikk blir stående som standard; ellers det fulleste navnet.
    const weight = (x: typeof a) => x.logs * 3 + x.relations + x.facts
    const keep = weight(a) !== weight(b) ? (weight(a) > weight(b) ? a : b) : a.name.length >= b.name.length ? a : b
    return { a, b, suggestedKeep: keep.id, reason: d.reason }
  })
}

export type DuplicateItem = Awaited<ReturnType<typeof getDuplicates>>[number]
