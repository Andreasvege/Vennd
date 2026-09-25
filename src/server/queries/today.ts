import 'server-only'
import { getReminders } from './reminders'
import { getRecentLogs } from './log'
import { prisma } from '@/lib/prisma'

/** Det «I dag» viser, i prioritert rekkefølge. */
export async function getToday(userId: string) {
  const [reminders, recent, personCount] = await Promise.all([
    getReminders(userId),
    getRecentLogs(userId, 5),
    prisma.person.count({ where: { userId } }),
  ])
  return {
    due: reminders.filter((r) => r.kind === 'thread'),
    reach: reminders.filter((r) => r.kind === 'cadence'),
    recent,
    isEmpty: personCount === 0,
  }
}

export type TodayData = Awaited<ReturnType<typeof getToday>>
