import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { interpretQuery, snippet, type Interpretation, type Segment } from '@/domain/search'
import { personTint } from '@/lib/palette'

const LIMIT = { persons: 5, logs: 8, threads: 5, plans: 3 }
const MAX_QUERY = 100

const has = (term: string) => ({ contains: term, mode: 'insensitive' as const })
const namesOf = (rows: { person: { id: string; name: string } }[]) => rows.map((r) => r.person)

/** Loggene som passer tolkningen: med disse personene, og med alle ordene i teksten. */
export function logFilter({ people, terms }: Interpretation): Prisma.LogEntryWhereInput {
  return {
    AND: [
      ...people.map((ids) => ({ participants: { some: { personId: { in: ids } } } })),
      ...terms.map((term) => ({ body: has(term) })),
    ],
  }
}

/** Tolker et søk mot brukerens egne personer. */
export async function interpretFor(userId: string, q: string) {
  const persons = await prisma.person.findMany({
    where: { userId },
    select: { id: true, name: true, primaryTag: { select: { color: true } } },
  })
  return { persons, interpretation: interpretQuery(q.slice(0, MAX_QUERY), persons) }
}

/**
 * Søk på tvers av personer, logger, tråder og planer. Navn i søket blir
 * filter («ingrid intervju» = det Ingrid sa om intervjuet); resten må stå
 * i teksten. Datoer er ISO-strenger, så svaret kan sendes som JSON.
 */
export async function searchAll(userId: string, q: string) {
  const { persons, interpretation } = await interpretFor(userId, q)
  const { people, terms } = interpretation
  if (people.length === 0 && terms.length === 0) return { persons: [], logs: [], threads: [], plans: [], terms }

  const named = new Set(people.flat())
  const peopleIn = people.map((ids) => ({ persons: { some: { personId: { in: ids } } } }))

  const [textPersons, logs, threads, plans] = await Promise.all([
    terms.length
      ? prisma.person.findMany({
          where: {
            userId,
            AND: terms.map((term) => ({
              OR: [
                { name: has(term) },
                { notes: has(term) },
                { facts: { some: { OR: [{ label: has(term) }, { value: has(term) }] } } },
                { tags: { some: { tag: { name: has(term) } } } },
              ],
            })),
          },
          orderBy: { name: 'asc' },
          take: LIMIT.persons,
          select: {
            id: true,
            name: true,
            notes: true,
            primaryTag: { select: { color: true } },
            facts: { select: { label: true, value: true } },
            tags: { select: { tag: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
    prisma.logEntry.findMany({
      where: { userId, participants: { some: {} }, ...logFilter(interpretation) },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: LIMIT.logs,
      select: {
        id: true,
        date: true,
        type: true,
        body: true,
        participants: { select: { person: { select: { id: true, name: true } } } },
      },
    }),
    prisma.thread.findMany({
      where: {
        userId,
        AND: [...peopleIn, ...terms.map((term) => ({ OR: [{ title: has(term) }, { resolution: has(term) }] }))],
      },
      // OPEN kommer før CLOSED i enumen: åpne tråder først.
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: LIMIT.threads,
      select: {
        id: true,
        title: true,
        status: true,
        resolution: true,
        persons: { select: { person: { select: { id: true, name: true } } } },
      },
    }),
    prisma.plan.findMany({
      where: { userId, status: 'PLANNED', AND: [...peopleIn, ...terms.map((term) => ({ title: has(term) }))] },
      orderBy: { at: 'desc' },
      take: LIMIT.plans,
      select: {
        id: true,
        at: true,
        hasTime: true,
        title: true,
        persons: { select: { person: { select: { id: true, name: true } } } },
      },
    }),
  ])

  // Hvor treffet var, når det ikke var i navnet.
  const where = (p: (typeof textPersons)[number]): Segment[] | null => {
    const lower = (s: string) => s.toLowerCase()
    const inText = (s: string) => terms.some((term) => lower(s).includes(term))
    if (terms.every((term) => lower(p.name).includes(term))) return null
    const fact = p.facts.find((f) => inText(f.label) || inText(f.value))
    if (fact) return snippet(`${fact.label}: ${fact.value}`, terms)
    const tag = p.tags.find(({ tag }) => inText(tag.name))
    if (tag) return snippet(tag.tag.name, terms)
    return p.notes ? snippet(p.notes, terms, 40) : null
  }

  const byName = persons
    .filter((p) => named.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, tint: personTint(p), where: null as Segment[] | null }))
  const byText = textPersons
    .filter((p) => !named.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, tint: personTint(p), where: where(p) }))

  return {
    terms,
    persons: [...byName, ...byText].slice(0, LIMIT.persons),
    logs: logs.map((l) => ({
      id: l.id,
      date: l.date.toISOString(),
      type: l.type,
      participants: namesOf(l.participants),
      snippet: l.body ? snippet(l.body, terms) : [],
    })),
    threads: threads.map((th) => ({
      id: th.id,
      title: th.title,
      open: th.status === 'OPEN',
      persons: namesOf(th.persons),
      snippet: snippet(th.resolution ? `${th.title} → ${th.resolution}` : th.title, terms),
    })),
    plans: plans.map((p) => ({
      id: p.id,
      at: p.at.toISOString(),
      hasTime: p.hasTime,
      title: p.title,
      persons: namesOf(p.persons),
    })),
  }
}

export type SearchResults = Awaited<ReturnType<typeof searchAll>>
