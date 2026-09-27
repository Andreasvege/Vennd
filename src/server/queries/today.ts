import 'server-only'
import { cache } from 'react'
import { getReminders } from './reminders'
import { getRecentLogs } from './log'
import { prisma } from '@/lib/prisma'
import { getAhead } from './plans'
import { getPendingSuggestions } from './suggestions'
import { notArchived } from './visibility'

/**
 * Det «I dag» viser, i prioritert rekkefølge. cache(): på forsiden ber både
 * siden (mobil) og panelet (PC) om det i samme forespørsel.
 */
export const getToday = cache(async function getToday(userId: string) {
  const [reminders, recent, personCount, unsorted, ahead, suggestions] = await Promise.all([
    getReminders(userId),
    getRecentLogs(userId, 5),
    prisma.person.count({ where: { userId, ...notArchived } }),
    prisma.person.count({ where: { userId, sortedAt: null, ...notArchived } }),
    getAhead(userId),
    getPendingSuggestions(userId),
  ])
  return {
    due: reminders.filter((r) => r.kind === 'thread'),
    // Uten noen logget kontakt vet vi ikke om det er lenge siden. Etter en
    // import er det mange av dem, og de ville druknet dem som faktisk er
    // forfalt; de samles i én linje (unntatt når du har noe å spørre om).
    reach: reminders.filter((r) => r.kind === 'cadence' && (!r.never || r.ask)),
    neverLogged: reminders.filter((r) => r.kind === 'cadence' && r.never && !r.ask),
    recent,
    ahead,
    suggestions,
    isEmpty: personCount === 0,
    unsorted,
  }
})

export type TodayData = Awaited<ReturnType<typeof getToday>>
