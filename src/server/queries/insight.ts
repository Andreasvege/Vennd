import 'server-only'
import { prisma } from '@/lib/prisma'
import { byPrimaryTag, byType, rhythm, topPeople, unseenBands, weekly } from '@/domain/insight'
import { isTagColor, personTint, type TagColor } from '@/lib/palette'
import { getLastContact } from './lastContact'
import { onMap } from './visibility'

export const PERIODS = [30, 90, 365] as const
export type Period = (typeof PERIODS)[number]
export const DEFAULT_PERIOD: Period = 90

export function parsePeriod(raw: string | undefined): Period {
  const n = Number(raw)
  return (PERIODS as readonly number[]).includes(n) ? (n as Period) : DEFAULT_PERIOD
}

/**
 * Innsikten: hvem du ikke har sett (alltid regnet fra nå), og hvordan
 * kontakten i perioden fordeler seg på miljøer, typer, personer og uker.
 */
export async function getInsight(userId: string, days: Period, now: Date = new Date()) {
  const from = new Date(now.getTime() - days * 86_400_000)
  const [logs, persons, tags, lastContact] = await Promise.all([
    prisma.logEntry.findMany({
      where: { userId, date: { gte: from, lte: now }, participants: { some: {} } },
      select: { date: true, type: true, participants: { select: { personId: true } } },
    }),
    prisma.person.findMany({
      // Innsikten gjelder kartet ditt; usorterte ville fylt «Aldri logget».
      where: { userId, ...onMap },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        cadenceWeeks: true,
        primaryTagId: true,
        primaryTag: { select: { color: true } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, color: true },
    }),
    getLastContact(userId),
  ])

  const people = persons.map((p) => ({
    id: p.id,
    name: p.name,
    photoUrl: p.photoUrl,
    tint: personTint(p),
    reminds: p.cadenceWeeks !== null,
    lastContact: lastContact.get(p.id) ?? null,
  }))
  const byId = new Map(people.map((p) => [p.id, p]))
  const shaped = logs.map((l) => ({ date: l.date, type: l.type, personIds: l.participants.map((x) => x.personId) }))
  const tagById = new Map(tags.map((tag) => [tag.id, tag]))

  const environments = byPrimaryTag(shaped, new Map(persons.map((p) => [p.id, p.primaryTagId]))).map(({ tagId, count }) => {
    const tag = tagId ? tagById.get(tagId) : undefined
    return {
      id: tagId,
      name: tag?.name ?? null,
      color: (tag && isTagColor(tag.color) ? tag.color : 'stone') as TagColor,
      count,
    }
  })

  const often = topPeople(shaped).flatMap(({ personId, count, dates }) => {
    const person = byId.get(personId)
    return person ? [{ ...person, count, every: rhythm(dates) }] : []
  })

  return {
    days,
    total: logs.length,
    unseen: unseenBands(people, now),
    environments,
    types: byType(shaped),
    often,
    weeks: weekly(shaped, from, now),
  }
}

export type Insight = Awaited<ReturnType<typeof getInsight>>
export type UnseenPerson = Insight['unseen']['year'][number]
