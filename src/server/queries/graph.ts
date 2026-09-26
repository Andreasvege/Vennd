import 'server-only'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { derivePairs } from '@/domain/derivePairs'
import { isTagColor, personTint } from '@/lib/palette'
import { getLastContact } from './lastContact'
import { onMap } from './visibility'

// Nok til å se hvem som ofte er sammen, uten å lese hele dagboken for hvert kart.
const DERIVED_FROM_LAST = 1000
const MAX_DERIVED = 40

/**
 * Alt kartet trenger: personene med farge, tagger og siste kontakt,
 * relasjonene, taggene i rekkefølge og hvem som ofte er med i samme logg.
 * cache(): forsiden og panelet kan spørre i samme forespørsel.
 */
export const getGraph = cache(async function getGraph(userId: string) {
  const [persons, relationships, tags, lastContact, sharedLogs, unsorted] = await Promise.all([
    prisma.person.findMany({
      where: { userId, ...onMap },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        relationLabel: true,
        photoUrl: true,
        positionX: true,
        positionY: true,
        cadenceWeeks: true,
        primaryTag: { select: { id: true, name: true, color: true } },
        tags: { select: { tagId: true } },
      },
    }),
    // Begge ender må eies av brukeren, ellers kunne en relasjon lekke en
    // annen brukers person.
    prisma.relationship.findMany({
      where: { fromPerson: { userId, ...onMap }, toPerson: { userId, ...onMap } },
      select: { id: true, fromPersonId: true, toPersonId: true, type: true, label: true, until: true },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, color: true },
    }),
    getLastContact(userId),
    prisma.logEntry.findMany({
      where: { userId, participants: { some: {} } },
      orderBy: { date: 'desc' },
      take: DERIVED_FROM_LAST,
      select: { participants: { select: { personId: true } } },
    }),
    prisma.person.count({ where: { userId, sortedAt: null, archivedAt: null } }),
  ])

  // Bare logger med flere personer kan si noe om hvem som er sammen; de
  // tydeligste parene først, og ikke flere enn kartet tåler å vise.
  // Par med noen som ikke står på kartet, har ingen ende å tegnes mellom.
  const shown = new Set(persons.map((p) => p.id))
  const derived = derivePairs(
    sharedLogs
      .map((l) => ({ personIds: l.participants.map((p) => p.personId) }))
      .filter((l) => l.personIds.length > 1),
    relationships.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]),
  )
    .filter((d) => shown.has(d.a) && shown.has(d.b))
    .slice(0, MAX_DERIVED)

  return {
    persons: persons.map(({ tags: personTags, ...p }) => ({
      ...p,
      tint: personTint(p),
      tagIds: personTags.map((t) => t.tagId),
      lastContact: lastContact.get(p.id) ?? null,
    })),
    relationships,
    tags: tags.map((t) => ({ ...t, color: isTagColor(t.color) ? t.color : ('stone' as const) })),
    derived,
    // Står i Venter-bunken, ikke på kartet: kartet viser en vei dit.
    unsorted,
  }
})

export type Graph = Awaited<ReturnType<typeof getGraph>>
export type MapPerson = Graph['persons'][number]
export type MapRelationship = Graph['relationships'][number]
export type MapTag = Graph['tags'][number]
export type DerivedPair = Graph['derived'][number]
