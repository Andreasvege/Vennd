import 'server-only'
import { prisma } from '@/lib/prisma'
import { lastContactByPerson } from '@/domain/cadence'
import { computeAutoReminders } from '@/domain/reminders'
import { personTint, type TagColor } from '@/lib/palette'

export type ReminderItem = {
  /** «cadence:<personId>» eller trådens id. Bare en React-nøkkel for kadens. */
  id: string
  kind: 'cadence' | 'thread'
  personId: string
  personName: string
  tint: TagColor
  message: string
  /** Den eldste åpne tråden med personen: det du kan spørre om. */
  ask: string | null
}

/**
 * Hvem du bør ta kontakt med nå: de som har passert kadensen sin, og tråder
 * med en dato som er kommet. Kadensen beregnes her og lagres aldri.
 */
export async function getReminders(userId: string, now: Date = new Date()): Promise<ReminderItem[]> {
  const [persons, logs, dueThreads] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        userId: true,
        cadenceWeeks: true,
        snoozedUntil: true,
        primaryTag: { select: { color: true } },
        threads: {
          where: { thread: { status: 'OPEN' } },
          orderBy: { thread: { createdAt: 'asc' } },
          take: 1,
          select: { thread: { select: { title: true } } },
        },
      },
    }),
    prisma.logEntry.findMany({
      where: { userId },
      select: { date: true, participants: { select: { personId: true } } },
    }),
    prisma.thread.findMany({
      where: { userId, status: 'OPEN', dueDate: { lte: now } },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        persons: {
          take: 1,
          select: { person: { select: { id: true, name: true, primaryTag: { select: { color: true } } } } },
        },
      },
    }),
  ])

  const lastContact = lastContactByPerson(
    logs.map((l) => ({ date: l.date, personIds: l.participants.map((p) => p.personId) })),
  )
  const byId = new Map(persons.map((p) => [p.id, p]))

  const threads: ReminderItem[] = dueThreads.flatMap((th) => {
    const person = th.persons[0]?.person
    if (!person) return []
    return [
      {
        id: th.id,
        kind: 'thread' as const,
        personId: person.id,
        personName: person.name,
        tint: personTint(person),
        message: th.title,
        ask: null,
      },
    ]
  })

  const cadence: ReminderItem[] = computeAutoReminders(
    persons.map((p) => ({ ...p, lastContactDate: lastContact.get(p.id) ?? null })),
    now,
  ).map((r) => {
    const p = byId.get(r.personId)!
    return {
      id: `cadence:${r.personId}`,
      kind: 'cadence' as const,
      personId: r.personId,
      personName: r.personName,
      tint: personTint(p),
      message: r.message,
      ask: p.threads[0]?.thread.title ?? null,
    }
  })

  // Tråder med dato først: de har en frist du selv har satt.
  return [...threads, ...cadence]
}
