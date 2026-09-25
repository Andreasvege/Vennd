import 'server-only'
import { prisma } from '@/lib/prisma'
import { suggestionPayload } from '@/server/schemas'

// Et forslag som har ligget i to uker uten svar, er ikke lenger relevant.
const FRESH_DAYS = 14

export type SuggestionItem =
  | { id: string; kind: 'THREAD'; title: string; people: string[] }
  | { id: string; kind: 'FACT'; person: string; label: string; value: string }
  | { id: string; kind: 'PARTICIPANT'; person: string; log: string }
  | { id: string; kind: 'PERSON'; name: string; log: string }

const firstLine = (body: string | null) => (body ?? '').split('\n')[0].slice(0, 60)

/**
 * Forslag som venter på svar, nyeste først. Med `personId`: bare det som
 * gjelder personen (tråder og fakta), til profilen.
 */
export async function getPendingSuggestions(userId: string, personId?: string): Promise<SuggestionItem[]> {
  const since = new Date(Date.now() - FRESH_DAYS * 86_400_000)
  const [rows, persons] = await Promise.all([
    prisma.suggestion.findMany({
      where: { userId, status: 'PENDING', createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, kind: true, payload: true, logEntry: { select: { body: true } } },
    }),
    prisma.person.findMany({ where: { userId }, select: { id: true, name: true } }),
  ])
  const nameOf = new Map(persons.map((p) => [p.id, p.name]))

  // Innhold som ikke lenger passer skjemaet, eller peker på en slettet person, hoppes over.
  return rows.flatMap((r): SuggestionItem[] => {
    switch (r.kind) {
      case 'THREAD': {
        const p = suggestionPayload.THREAD.safeParse(r.payload)
        if (!p.success || (personId && !p.data.personIds.includes(personId))) return []
        const people = p.data.personIds.flatMap((id) => nameOf.get(id) ?? [])
        return people.length ? [{ id: r.id, kind: 'THREAD', title: p.data.title, people }] : []
      }
      case 'FACT': {
        const p = suggestionPayload.FACT.safeParse(r.payload)
        const person = p.success ? nameOf.get(p.data.personId) : undefined
        if (!p.success || !person || (personId && p.data.personId !== personId)) return []
        return [{ id: r.id, kind: 'FACT', person, label: p.data.label, value: p.data.value }]
      }
      case 'PARTICIPANT': {
        const p = suggestionPayload.PARTICIPANT.safeParse(r.payload)
        const person = p.success ? nameOf.get(p.data.personId) : undefined
        if (!p.success || !person || personId) return []
        return [{ id: r.id, kind: 'PARTICIPANT', person, log: firstLine(r.logEntry.body) }]
      }
      case 'PERSON': {
        const p = suggestionPayload.PERSON.safeParse(r.payload)
        if (!p.success || personId) return []
        return [{ id: r.id, kind: 'PERSON', name: p.data.name, log: firstLine(r.logEntry.body) }]
      }
    }
  })
}
