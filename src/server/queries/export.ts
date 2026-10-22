import 'server-only'
import { prisma } from '@/lib/prisma'
import { t } from '@/i18n'

export const EXPORT_VERSION = 1

/**
 * Alt du har skrevet, som ett JSON-dokument: personer (med fakta, tagger
 * og faser), relasjoner, logger, tråder, planer, tagger og visninger.
 * Id-ene beholdes, så dokumentet henger sammen og kan leses av et program.
 */
export async function getExport(userId: string) {
  const [persons, relationships, logs, threads, plans, tags, views] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        birthday: true,
        notes: true,
        photoUrl: true,
        cadenceWeeks: true,
        primaryTagId: true,
        createdAt: true,
        tags: { select: { tagId: true } },
        facts: { select: { label: true, value: true } },
        phases: { orderBy: { at: 'asc' }, select: { phase: true, at: true } },
      },
    }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId } },
      select: { id: true, fromPersonId: true, toPersonId: true, type: true, label: true, since: true, until: true },
    }),
    prisma.logEntry.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, type: true, body: true, participants: { select: { personId: true } } },
    }),
    prisma.thread.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        status: true,
        resolution: true,
        dueDate: true,
        openedById: true,
        closedById: true,
        createdAt: true,
        closedAt: true,
        persons: { select: { personId: true } },
      },
    }),
    prisma.plan.findMany({
      where: { userId },
      orderBy: { at: 'asc' },
      select: { id: true, title: true, at: true, hasTime: true, type: true, status: true, logEntryId: true, persons: { select: { personId: true } } },
    }),
    prisma.tag.findMany({ where: { userId }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, color: true } }),
    prisma.mapView.findMany({ where: { userId }, orderBy: { sortOrder: 'asc' }, select: { name: true, mode: true, filter: true } }),
  ])

  return {
    app: t.app.name,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    persons: persons.map(({ tags, ...p }) => ({ ...p, tagIds: tags.map((t) => t.tagId) })),
    relationships,
    logs: logs.map(({ participants, ...l }) => ({ ...l, personIds: participants.map((p) => p.personId) })),
    threads: threads.map(({ persons, ...th }) => ({ ...th, personIds: persons.map((p) => p.personId) })),
    plans: plans.map(({ persons, ...p }) => ({ ...p, personIds: persons.map((x) => x.personId) })),
    tags,
    views,
  }
}
