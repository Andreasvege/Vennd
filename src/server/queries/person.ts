import 'server-only'
import { prisma } from '@/lib/prisma'
import { currentPhase } from '@/domain/romance'
import { personTint } from '@/lib/palette'
import { getTags } from './tags'
import { getProximities } from './proximity'
import { getPersonPlans } from './plans'
import { getPendingSuggestions } from './suggestions'
import { isPhotosEnabled } from '@/server/blob'

/** Alt profilen viser om én person. null hvis den ikke finnes eller er en annens. */
export async function getPersonProfile(userId: string, id: string) {
  const person = await prisma.person.findFirst({
    where: { id, userId },
    include: {
      primaryTag: { select: { color: true } },
      tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
      facts: { orderBy: { createdAt: 'asc' }, select: { id: true, label: true, value: true } },
      phases: { orderBy: { at: 'asc' }, select: { phase: true, at: true } },
      participations: {
        orderBy: [{ logEntry: { date: 'desc' } }, { logEntry: { createdAt: 'desc' } }],
        select: {
          logEntry: {
            select: {
              id: true,
              date: true,
              type: true,
              body: true,
              participants: { select: { person: { select: { id: true, name: true } } } },
              threadsClosed: { select: { id: true, title: true, resolution: true } },
              threadsOpened: { select: { id: true, title: true, status: true } },
            },
          },
        },
      },
      relationsFrom: {
        select: {
          id: true, type: true, label: true, since: true, until: true,
          toPerson: { select: { id: true, name: true } },
        },
      },
      relationsTo: {
        select: {
          id: true, type: true, label: true, since: true, until: true,
          fromPerson: { select: { id: true, name: true } },
        },
      },
      threads: {
        where: { thread: { status: 'OPEN' } },
        orderBy: { thread: { createdAt: 'asc' } },
        select: {
          thread: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              createdAt: true,
              persons: { select: { person: { select: { id: true, name: true } } } },
            },
          },
        },
      },
    },
  })
  if (!person) return null

  const [closedByHand, factLabels, people, proximities, plans, suggestions] = await Promise.all([
    // Tråder lukket med sirkelen på profilen, ikke av en logg: de hører
    // likevel hjemme i historikken.
    prisma.thread.findMany({
      where: { userId, status: 'CLOSED', closedById: null, persons: { some: { personId: id } } },
      orderBy: { closedAt: 'desc' },
      select: { id: true, title: true, resolution: true, closedAt: true },
    }),
    prisma.fact.findMany({
      where: { person: { userId } },
      distinct: ['label'],
      select: { label: true },
    }),
    prisma.person.findMany({ where: { userId, id: { not: id } }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    getProximities(userId, id),
    getPersonPlans(userId, id),
    getPendingSuggestions(userId, id),
  ])

  const { primaryTag, tags, participations, threads, phases, relationsFrom, relationsTo, ...rest } = person
  return {
    ...rest,
    tint: personTint({ primaryTag }),
    tags: tags.map((t) => t.tag),
    phases,
    phase: currentPhase(phases),
    logs: participations.map(({ logEntry }) => ({
      ...logEntry,
      // «med Martin»: de andre som var med, ikke personen selv.
      others: logEntry.participants.map((p) => p.person).filter((p) => p.id !== id),
    })),
    openThreads: threads.map(({ thread }) => ({
      ...thread,
      others: thread.persons.map((p) => p.person).filter((p) => p.id !== id),
    })),
    closedByHand,
    relationships: [
      ...relationsFrom.map(({ toPerson, ...r }) => ({ ...r, other: toPerson })),
      ...relationsTo.map(({ fromPerson, ...r }) => ({ ...r, other: fromPerson })),
    ].sort((a, b) => Number(a.until !== null) - Number(b.until !== null) || a.other.name.localeCompare(b.other.name, 'nb')),
    factLabels: factLabels.map((f) => f.label),
    people,
    proximities,
    plans,
    suggestions,
  }
}

export type PersonProfileData = NonNullable<Awaited<ReturnType<typeof getPersonProfile>>>

/** Det redigeringsskjemaet trenger: personen, taggene dens og alle taggene du har. */
export async function getPersonForEdit(userId: string, id: string) {
  const [person, allTags] = await Promise.all([
    prisma.person.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        type: true,
        notes: true,
        birthday: true,
        cadenceWeeks: true,
        primaryTagId: true,
        photoUrl: true,
        primaryTag: { select: { color: true } },
        tags: { select: { tagId: true } },
      },
    }),
    getTags(userId),
  ])
  if (!person) return null
  const { tags, primaryTag, ...rest } = person
  return {
    person: { ...rest, tint: personTint({ primaryTag }), tagIds: tags.map((t) => t.tagId) },
    allTags,
    photosEnabled: isPhotosEnabled(),
  }
}

export type PersonEditData = NonNullable<Awaited<ReturnType<typeof getPersonForEdit>>>
