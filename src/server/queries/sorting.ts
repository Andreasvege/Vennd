import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { deckOrder } from '@/domain/sorting'
import { t } from '@/i18n'
import { notArchived, onMap } from './visibility'

/**
 * Det sorteringen trenger: de usorterte (i kortstokkens rekkefølge, med det
 * vi vet om dem), de som alt står på kartet (med miljøene sine, så kortet
 * kan foreslå hvem de kjenner), taggene, relasjonene og de arkiverte.
 */
export async function getSortingData(userId: string) {
  const [unsorted, sorted, tags, relationships, archived] = await Promise.all([
    prisma.person.findMany({
      where: { userId, sortedAt: null, ...notArchived },
      select: {
        id: true,
        name: true,
        birthday: true,
        notes: true,
        photoUrl: true,
        primaryTag: { select: { color: true } },
        tags: { select: { tagId: true } },
        facts: { select: { label: true, value: true } },
        _count: { select: { participations: true } },
      },
    }),
    prisma.person.findMany({
      where: { userId, ...onMap },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, primaryTag: { select: { color: true } }, tags: { select: { tagId: true } } },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, color: true, _count: { select: { persons: true } } },
    }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId }, toPerson: { userId } },
      select: { fromPersonId: true, toPersonId: true },
    }),
    prisma.person.findMany({ where: { userId, archivedAt: { not: null } }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const fact = (facts: { label: string; value: string }[], label: string) => facts.find((f) => f.label === label)?.value ?? null
  const shaped = unsorted.map((p) => ({
    id: p.id,
    name: p.name,
    birthday: p.birthday,
    notes: p.notes,
    photoUrl: p.photoUrl,
    tint: personTint(p),
    tagIds: p.tags.map((x) => x.tagId),
    phone: fact(p.facts, t.import.phoneLabel),
    email: fact(p.facts, t.import.emailLabel),
    logCount: p._count.participations,
  }))
  const order = deckOrder(shaped.map((p) => ({ ...p, hasBirthday: p.birthday !== null })))
  const byId = new Map(shaped.map((p) => [p.id, p]))

  return {
    unsorted: order.map((id) => byId.get(id)!),
    sorted: sorted.map((p) => ({ id: p.id, name: p.name, tint: personTint(p), tagIds: p.tags.map((x) => x.tagId) })),
    tags: tags.map(({ _count, ...tag }) => ({ ...tag, count: _count.persons })),
    pairs: relationships.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]),
    archived,
  }
}

export type SortingData = Awaited<ReturnType<typeof getSortingData>>
export type UnsortedPerson = SortingData['unsorted'][number]
export type SortingTag = SortingData['tags'][number]
