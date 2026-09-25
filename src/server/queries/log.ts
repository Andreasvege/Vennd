import 'server-only'
import { prisma } from '@/lib/prisma'

/** De siste loggene, nyeste først, med alle som var med. */
export async function getRecentLogs(userId: string, limit = 10) {
  const entries = await prisma.logEntry.findMany({
    // En logg uten deltakere (alle er slettet) hører ikke hjemme i tidslinjen.
    where: { userId, participants: { some: {} } },
    // Samme rekkefølge som dagboken (/logg), så «Sist logget» og loggen er enige.
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
    take: limit,
    select: {
      id: true,
      date: true,
      type: true,
      body: true,
      participants: { select: { person: { select: { id: true, name: true } } } },
    },
  })
  return entries.map(({ participants, ...e }) => ({
    ...e,
    participants: participants.map((p) => p.person),
  }))
}

export type RecentLog = Awaited<ReturnType<typeof getRecentLogs>>[number]

const PAGE = 30

/**
 * Hele dagboken, nyeste først, i sider på 30. Markøren er den siste loggen
 * på forrige side (dato + id), så sidene tåler at nye logger kommer til.
 */
export async function getLogPage(userId: string, before?: { date: Date; id: string }) {
  const entries = await prisma.logEntry.findMany({
    where: {
      userId,
      participants: { some: {} },
      ...(before && {
        OR: [{ date: { lt: before.date } }, { date: before.date, id: { lt: before.id } }],
      }),
    },
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
    take: PAGE + 1,
    select: {
      id: true,
      date: true,
      type: true,
      body: true,
      participants: { select: { person: { select: { id: true, name: true } } } },
      threadsClosed: { select: { id: true, title: true, resolution: true } },
      threadsOpened: { select: { id: true, title: true } },
    },
  })
  const page = entries.slice(0, PAGE).map(({ participants, ...e }) => ({
    ...e,
    participants: participants.map((p) => p.person),
  }))
  const last = page.at(-1)
  return { entries: page, next: entries.length > PAGE && last ? `${last.date.toISOString()}_${last.id}` : null }
}

export type LogPageEntry = Awaited<ReturnType<typeof getLogPage>>['entries'][number]
