import 'server-only'
import { prisma } from '@/lib/prisma'
import { splitPlans } from '@/domain/plans'
import { upcomingBirthdays } from '@/domain/birthdays'
import { personTint } from '@/lib/palette'

const personSelect = { select: { id: true, name: true, primaryTag: { select: { color: true } } } } as const

/** Planer som kommer, planer som venter på «hvordan gikk det?», og bursdager. */
export async function getAhead(userId: string, now: Date = new Date()) {
  const [plans, withBirthday] = await Promise.all([
    prisma.plan.findMany({
      where: { userId, status: 'PLANNED' },
      orderBy: { at: 'asc' },
      select: {
        id: true,
        at: true,
        hasTime: true,
        title: true,
        type: true,
        status: true,
        persons: { select: { person: personSelect } },
      },
    }),
    prisma.person.findMany({
      where: { userId, birthday: { not: null } },
      select: { id: true, name: true, birthday: true, primaryTag: { select: { color: true } } },
    }),
  ])

  const shaped = plans.map(({ persons, ...p }) => ({
    ...p,
    persons: persons.map(({ person }) => ({ id: person.id, name: person.name, tint: personTint(person) })),
  }))
  const { upcoming, awaiting } = splitPlans(shaped, now)
  const birthdays = upcomingBirthdays(withBirthday, now).map((p) => ({
    id: p.id,
    name: p.name,
    tint: personTint(p),
    date: p.next.date,
    inDays: p.next.inDays,
    turns: p.next.turns,
  }))

  const briefs = await getBriefs(userId, [...new Set(upcoming.flatMap((p) => p.persons.map((x) => x.id)))])
  return { upcoming, awaiting, birthdays, briefs }
}

export type Ahead = Awaited<ReturnType<typeof getAhead>>
export type PlanItem = Ahead['upcoming'][number]
export type BirthdayItem = Ahead['birthdays'][number]

/**
 * Oversikten før et treff: for hver person det du bør spørre om, hva dere
 * snakket om sist og det du vil huske. Hentes bare for de som har noe
 * planlagt den neste uka.
 */
export async function getBriefs(userId: string, personIds: string[]) {
  if (personIds.length === 0) return {}
  const persons = await prisma.person.findMany({
    where: { userId, id: { in: personIds } },
    select: {
      id: true,
      name: true,
      primaryTag: { select: { color: true } },
      facts: { orderBy: { createdAt: 'asc' }, select: { id: true, label: true, value: true } },
      threads: {
        where: { thread: { status: 'OPEN' } },
        orderBy: { thread: { createdAt: 'asc' } },
        select: { thread: { select: { id: true, title: true } } },
      },
      participations: {
        orderBy: [{ logEntry: { date: 'desc' } }, { logEntry: { id: 'desc' } }],
        take: 1,
        select: { logEntry: { select: { id: true, date: true, body: true, type: true } } },
      },
    },
  })
  return Object.fromEntries(
    persons.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        tint: personTint(p),
        facts: p.facts,
        ask: p.threads.map((t) => t.thread),
        last: p.participations[0]?.logEntry ?? null,
      },
    ]),
  )
}

export type Brief = Awaited<ReturnType<typeof getBriefs>>[string]

/** Det som er planlagt med én person, til profilen. */
export async function getPersonPlans(userId: string, personId: string) {
  return prisma.plan.findMany({
    where: { userId, status: 'PLANNED', persons: { some: { personId } } },
    orderBy: { at: 'asc' },
    select: { id: true, at: true, hasTime: true, title: true },
  })
}
