import 'server-only'
import { prisma } from '@/lib/prisma'
import { getLastContact } from './lastContact'
import { computeAutoReminders } from '@/domain/reminders'
import { personTint, type TagColor } from '@/lib/palette'
import { onMap } from './visibility'

function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999))
}

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
      // Bare folk på kartet: en usortert har ikke fått en nærhet å bli påminnet etter.
      where: { userId, ...onMap },
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
    getLastContact(userId),
    prisma.thread.findMany({
      // Datoer lagres kl. 12 UTC. «I dag» betyr hele dagen, ikke bare fram
      // til nå — ellers dukket dagens tråder først opp klokka 14 norsk tid.
      // Bare tråder med noen som står på kartet; resten venter med personen.
      where: { userId, status: 'OPEN', dueDate: { lte: endOfUtcDay(now) }, persons: { some: { person: onMap } } },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        persons: {
          where: { person: onMap },
          take: 1,
          select: { person: { select: { id: true, name: true, primaryTag: { select: { color: true } } } } },
        },
      },
    }),
  ])

  const lastContact = logs
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
