import 'server-only'
import { prisma } from '@/lib/prisma'
import { currentPhase } from '@/domain/romance'
import { personTint } from '@/lib/palette'
import { getTags } from './tags'

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
            },
          },
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

  const { primaryTag, tags, participations, threads, phases, ...rest } = person
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
        tags: { select: { tagId: true } },
      },
    }),
    getTags(userId),
  ])
  if (!person) return null
  const { tags, ...rest } = person
  return { person: { ...rest, tagIds: tags.map((t) => t.tagId) }, allTags }
}

export type PersonEditData = NonNullable<Awaited<ReturnType<typeof getPersonForEdit>>>
