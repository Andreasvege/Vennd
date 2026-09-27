import 'server-only'
import { prisma } from '@/lib/prisma'
import { suggestionPayload } from '@/server/schemas'
import { notArchived } from './visibility'
import { t } from '@/i18n'

// Et forslag som har ligget i to uker uten svar, er ikke lenger relevant.
const FRESH_DAYS = 14

export type SuggestionItem =
  | { id: string; logId: string; kind: 'THREAD'; title: string; people: string[] }
  | { id: string; logId: string; kind: 'FACT'; person: string; label: string; value: string }
  | { id: string; logId: string; kind: 'PARTICIPANT'; person: string; log: string }
  | { id: string; logId: string; kind: 'PERSON'; name: string; log: string }
  | { id: string; logId: string; kind: 'RELATIONSHIP'; a: string; b: string; label: string }

const firstLine = (body: string | null) => (body ?? '').split('\n')[0].slice(0, 60)

/**
 * Forslag som venter på svar, nyeste først. Med `personId`: bare det som
 * gjelder personen (tråder, fakta og forbindelser), til profilen. Med
 * `logEntryId`: bare forslagene til den loggen (rett etter at du lagret).
 */
export async function getPendingSuggestions(userId: string, personId?: string, logEntryId?: string): Promise<SuggestionItem[]> {
  const since = new Date(Date.now() - FRESH_DAYS * 86_400_000)
  const [rows, persons] = await Promise.all([
    prisma.suggestion.findMany({
      where: { userId, status: 'PENDING', createdAt: { gte: since }, ...(logEntryId && { logEntryId }) },
      orderBy: { createdAt: 'desc' },
      select: { id: true, kind: true, payload: true, logEntryId: true, logEntry: { select: { body: true } } },
    }),
    prisma.person.findMany({ where: { userId, ...notArchived }, select: { id: true, name: true } }),
  ])
  const nameOf = new Map(persons.map((p) => [p.id, p.name]))

  // Innhold som ikke lenger passer skjemaet, eller peker på en slettet person, hoppes over.
  return rows.flatMap((r): SuggestionItem[] => {
    switch (r.kind) {
      case 'THREAD': {
        const p = suggestionPayload.THREAD.safeParse(r.payload)
        if (!p.success || (personId && !p.data.personIds.includes(personId))) return []
        const people = p.data.personIds.flatMap((id) => nameOf.get(id) ?? [])
        return people.length ? [{ id: r.id, logId: r.logEntryId, kind: 'THREAD', title: p.data.title, people }] : []
      }
      case 'FACT': {
        const p = suggestionPayload.FACT.safeParse(r.payload)
        const person = p.success ? nameOf.get(p.data.personId) : undefined
        if (!p.success || !person || (personId && p.data.personId !== personId)) return []
        return [{ id: r.id, logId: r.logEntryId, kind: 'FACT', person, label: p.data.label, value: p.data.value }]
      }
      case 'PARTICIPANT': {
        const p = suggestionPayload.PARTICIPANT.safeParse(r.payload)
        const person = p.success ? nameOf.get(p.data.personId) : undefined
        if (!p.success || !person || personId) return []
        return [{ id: r.id, logId: r.logEntryId, kind: 'PARTICIPANT', person, log: firstLine(r.logEntry.body) }]
      }
      case 'PERSON': {
        const p = suggestionPayload.PERSON.safeParse(r.payload)
        if (!p.success || personId) return []
        return [{ id: r.id, logId: r.logEntryId, kind: 'PERSON', name: p.data.name, log: firstLine(r.logEntry.body) }]
      }
      case 'RELATIONSHIP': {
        const p = suggestionPayload.RELATIONSHIP.safeParse(r.payload)
        if (!p.success) return []
        const a = nameOf.get(p.data.aId)
        const b = nameOf.get(p.data.bId)
        if (!a || !b || (personId && personId !== p.data.aId && personId !== p.data.bId)) return []
        return [{ id: r.id, logId: r.logEntryId, kind: 'RELATIONSHIP', a, b, label: p.data.label ?? t.relationType[p.data.type].toLowerCase() }]
      }
    }
  })
}
