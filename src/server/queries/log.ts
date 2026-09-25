import 'server-only'
import { prisma } from '@/lib/prisma'

/** De siste loggene, nyeste først, med alle som var med. */
export async function getRecentLogs(userId: string, limit = 10) {
  const entries = await prisma.logEntry.findMany({
    where: { userId },
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
