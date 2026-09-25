import 'server-only'
import { cache } from 'react'
import { getReminders } from './reminders'
import { getRecentLogs } from './log'
import { prisma } from '@/lib/prisma'
import { getAhead } from './plans'
import { getPendingSuggestions } from './suggestions'

/**
 * Det «I dag» viser, i prioritert rekkefølge. cache(): på forsiden ber både
 * siden (mobil) og panelet (PC) om det i samme forespørsel.
 */
export const getToday = cache(async function getToday(userId: string) {
  const [reminders, recent, personCount, ahead, suggestions] = await Promise.all([
    getReminders(userId),
    getRecentLogs(userId, 5),
    prisma.person.count({ where: { userId } }),
    getAhead(userId),
    getPendingSuggestions(userId),
  ])
  return {
    due: reminders.filter((r) => r.kind === 'thread'),
    reach: reminders.filter((r) => r.kind === 'cadence'),
    recent,
    ahead,
    suggestions,
    isEmpty: personCount === 0,
  }
})

export type TodayData = Awaited<ReturnType<typeof getToday>>
