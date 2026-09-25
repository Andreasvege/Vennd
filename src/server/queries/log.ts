import 'server-only'
import { prisma } from '@/lib/prisma'

/** De siste loggene, nyeste først, med alle som var med. */
export async function getRecentLogs(userId: string, limit = 10) {
  const entries = await prisma.logEntry.findMany({
    // En logg uten deltakere (alle er slettet) hører ikke hjemme i tidslinjen.
    where: { userId, participants: { some: {} } },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
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
