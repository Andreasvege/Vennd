import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { answeredPairs, groupClusters, insightPairs, linkCandidates, pairKey, withAssessments, type LinkRow } from '@/domain/linkSuggestions'
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
        primaryTagId: true,
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

/**
 * Forslagene i grupper: innsiktene fra Claude (når du har spurt), og
 * reglenes grupper («Kjenner vennene til Nora hverandre?»). Bare det som
 * faktisk er nytt, og bare folk som står på kartet.
 */
export async function getGroupSuggestions(userId: string) {
  const [{ people, rels, candidates }, insights, tags] = await Promise.all([
    loadLinkState(userId),
    prisma.linkInsight.findMany({ where: { userId, status: 'OPEN' }, orderBy: { createdAt: 'asc' } }),
    prisma.tag.findMany({ where: { userId }, select: { id: true, name: true } }),
  ])
  const byId = new Map(people.map((p) => [p.id, p]))
  const person = (id: string) => {
    const p = byId.get(id)
    return p ? [{ id: p.id, name: p.name, tint: p.tint, photoUrl: p.photoUrl }] : []
  }
  const linked = new Set(rels.map((r) => pairKey(r.from, r.to)))

  const fromClaude = insights.flatMap((i) => {
    const hub = i.hubId ? person(i.hubId)[0] : null
    if (i.hubId && !hub) return []
    const members = (i.memberIds as string[]).flatMap(person)
    const kind = i.kind === 'hub' ? ('hub' as const) : ('group' as const)
    const fresh = insightPairs(kind, i.hubId, members.map((m) => m.id)).filter(([a, b]) => !linked.has(pairKey(a, b)))
    if (fresh.length === 0) return []
    return [{ id: i.id, title: i.title, reason: i.reason, kind, hub, members, type: i.type, label: i.label, groupName: i.groupName, count: fresh.length }]
  })

  const clusters = groupClusters(
    candidates,
    people.map((p) => ({ id: p.id, name: p.name, groupId: p.primaryTagId })),
    rels,
    new Map(tags.map((tag) => [tag.id, tag.name])),
  )
  const fromRules = clusters.map((c) => ({
    key: c.key,
    sides: [c.a, ...(c.b ? [c.b] : [])].map((side) => ({ label: side.label, members: side.ids.flatMap(person) })),
    pairs: c.pairs,
    hubs: c.hubs.flatMap((id) => person(id).map((p) => p.name)),
    sameSurname: c.sameSurname,
    type: c.type,
  }))

  return { fromClaude, fromRules }
}

export type GroupSuggestions = Awaited<ReturnType<typeof getGroupSuggestions>>
export type InsightItem = GroupSuggestions['fromClaude'][number]
export type ClusterItem = GroupSuggestions['fromRules'][number]
