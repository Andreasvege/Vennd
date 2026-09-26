import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { answeredPairs, linkCandidates, withAssessments, type LinkRow } from '@/domain/linkSuggestions'
import { onMap } from './visibility'

/**
 * Nettverket slik forslagene ser det: personene på kartet, relasjonene
 * mellom dem, og radene med Claudes vurderinger og dine svar.
 */
export async function loadLinkState(userId: string) {
  const [persons, relations, rows] = await Promise.all([
    prisma.person.findMany({
      where: { userId, ...onMap },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        type: true,
        relationLabel: true,
        primaryTag: { select: { color: true } },
        tags: { select: { tagId: true } },
      },
    }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId, ...onMap }, toPerson: { userId, ...onMap } },
      select: { fromPersonId: true, toPersonId: true, type: true, label: true },
    }),
    prisma.linkSuggestion.findMany({
      where: { userId },
      select: { aId: true, bId: true, status: true, assessed: true, keep: true, type: true, label: true, reason: true },
    }),
  ])
  const people = persons.map((p) => ({ ...p, tagIds: p.tags.map((x) => x.tagId), tint: personTint(p) }))
  const rels = relations.map((r) => ({ from: r.fromPersonId, to: r.toPersonId, type: r.type, label: r.label }))
  const candidates = linkCandidates(people, rels, answeredPairs(rows as LinkRow[]))
  return { people, rels, rows: rows as LinkRow[], candidates }
}

/**
 * Forslag til forbindelser, sterkest først. Med `personId`: bare de som
 * gjelder personen (til profilen).
 */
export async function getLinkSuggestions(userId: string, personId?: string, limit?: number) {
  const { people, rows, candidates } = await loadLinkState(userId)
  const byId = new Map(people.map((p) => [p.id, p]))
  const person = (id: string) => {
    const p = byId.get(id)!
    return { id: p.id, name: p.name, tint: p.tint, photoUrl: p.photoUrl }
  }
  const views = withAssessments(candidates, rows).filter((v) => !personId || v.a === personId || v.b === personId)
  return views.slice(0, limit ?? views.length).map((v) => ({
    a: person(v.a),
    b: person(v.b),
    type: v.type,
    label: v.label,
    reason: v.reason,
    fromClaude: v.fromClaude,
    shared: v.shared.slice(0, 3).map((id) => byId.get(id)!.name.split(' ')[0]),
    surname: v.sameSurname ? byId.get(v.a)!.name.trim().split(/\s+/).at(-1)! : null,
    sharedCount: v.shared.length,
  }))
}

export type LinkSuggestionItem = Awaited<ReturnType<typeof getLinkSuggestions>>[number]
