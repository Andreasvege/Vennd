import type { RelationshipType } from '@/types'

export type LinkPerson = { id: string; name: string; tagIds: string[] }
export type LinkRelation = { from: string; to: string; type: RelationshipType; label: string | null }

export type LinkCandidate = {
  /** a < b, så paret er entydig. */
  a: string
  b: string
  score: number
  /** Personer begge kjenner. */
  shared: string[]
  sameSurname: boolean
  sharedTags: string[]
  /** Regelgjetning; Claude kan overstyre med noe mer presist. */
  type: RelationshipType
}

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

const surname = (name: string) => {
  const parts = name.trim().toLocaleLowerCase('nb').split(/\s+/)
  return parts.length > 1 ? parts.at(-1)! : null
}

/**
 * Hvem som sannsynligvis kjenner hverandre, ut fra strukturen: to uten
 * relasjon som har minst to felles bekjente, eller én felles og i tillegg
 * samme etternavn eller et felles miljø. Én felles venn alene er for tynt.
 * Sterkest først. `dismissed` er par (pairKey) du har sagt nei til.
 */
export function linkCandidates(
  persons: LinkPerson[],
  relations: LinkRelation[],
  dismissed: Set<string> = new Set(),
): LinkCandidate[] {
  const byId = new Map(persons.map((p) => [p.id, p]))
  const neighbours = new Map<string, Map<string, LinkRelation>>()
  const linked = new Set<string>()
  for (const r of relations) {
    linked.add(pairKey(r.from, r.to))
    if (!byId.has(r.from) || !byId.has(r.to)) continue
    for (const [x, y] of [
      [r.from, r.to],
      [r.to, r.from],
    ]) {
      if (!neighbours.has(x)) neighbours.set(x, new Map())
      neighbours.get(x)!.set(y, r)
    }
  }

  // Par som deler minst én nabo: gå via naboene i stedet for alle par.
  const sharedBy = new Map<string, Set<string>>()
  for (const [hub, ns] of neighbours) {
    const ids = [...ns.keys()]
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = pairKey(ids[i], ids[j])
        if (!sharedBy.has(key)) sharedBy.set(key, new Set())
        sharedBy.get(key)!.add(hub)
      }
    }
  }

  const out: LinkCandidate[] = []
  for (const [key, hubs] of sharedBy) {
    if (linked.has(key) || dismissed.has(key)) continue
    const [a, b] = key.split('|')
    const pa = byId.get(a)!
    const pb = byId.get(b)!
    const sa = surname(pa.name)
    const sameSurname = sa !== null && sa === surname(pb.name)
    const sharedTags = pa.tagIds.filter((id) => pb.tagIds.includes(id))
    if (hubs.size < 2 && !sameSurname && sharedTags.length === 0) continue

    const shared = [...hubs]
    const viaRelations = shared.flatMap((h) => [neighbours.get(h)!.get(a)!, neighbours.get(h)!.get(b)!])
    const allFamily = viaRelations.every((r) => r.type === 'FAMILY')
    const someFamily = viaRelations.some((r) => r.type === 'FAMILY')
    out.push({
      a,
      b,
      score: shared.length * 2 + (sameSurname ? 2 : 0) + sharedTags.length,
      shared,
      sameSurname,
      sharedTags,
      type: allFamily || (sameSurname && someFamily) ? 'FAMILY' : 'FRIEND',
    })
  }
  return out.sort((x, y) => y.score - x.score || x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
}

/** En lagret vurdering eller et svar fra deg (LinkSuggestion-raden). */
export type LinkRow = {
  aId: string
  bId: string
  status: 'OPEN' | 'ACCEPTED' | 'DISMISSED'
  assessed: boolean
  keep: boolean
  type: RelationshipType | null
  label: string | null
  reason: string | null
}

export type LinkView = LinkCandidate & { label: string | null; reason: string | null; fromClaude: boolean }

/** Par du har svart på (avvist eller lagt til), som ikke skal foreslås igjen. */
export function answeredPairs(rows: LinkRow[]): Set<string> {
  return new Set(rows.filter((r) => r.status !== 'OPEN').map((r) => pairKey(r.aId, r.bId)))
}

/**
 * Kandidatene med Claudes vurdering lagt oppå: det Claude mener ikke gir
 * mening, skjules; ellers vinner Claudes type, etikett og begrunnelse over
 * regelgjetningen.
 */
export function withAssessments(candidates: LinkCandidate[], rows: LinkRow[]): LinkView[] {
  const byKey = new Map(rows.map((r) => [pairKey(r.aId, r.bId), r]))
  return candidates.flatMap((c): LinkView[] => {
    const row = byKey.get(pairKey(c.a, c.b))
    if (row && row.status !== 'OPEN') return []
    if (!row?.assessed) return [{ ...c, label: null, reason: null, fromClaude: false }]
    if (!row.keep) return []
    return [{ ...c, type: row.type ?? c.type, label: row.label, reason: row.reason, fromClaude: true }]
  })
}

/** Et navn fra Claude til én person: fullt navn, og bare når det er entydig. */
export function idByName(persons: { id: string; name: string }[]): (name: string) => string | null {
  const byName = new Map<string, string[]>()
  for (const p of persons) {
    const k = p.name.trim().toLocaleLowerCase('nb')
    byName.set(k, [...(byName.get(k) ?? []), p.id])
  }
  return (name) => {
    const ids = byName.get(name.trim().toLocaleLowerCase('nb')) ?? []
    return ids.length === 1 ? ids[0] : null
  }
}

export type HubCluster = {
  /** Personen de alle kjenner: «Kjenner vennene til Nora hverandre?» */
  hub: string
  members: string[]
  /** Parene i gruppen som ikke er koblet ennå. */
  pairs: [string, string][]
  type: RelationshipType
}

/**
 * Hundrevis av enkeltpar samlet til en håndfull spørsmål: grupper av folk
 * som samme person kjenner, men som ikke er koblet til hverandre. Grådig:
 * den som samler flest ubesvarte par, først; hvert par hører til én gruppe.
 */
export function hubClusters(candidates: LinkCandidate[]): HubCluster[] {
  const byHub = new Map<string, LinkCandidate[]>()
  for (const c of candidates) for (const h of c.shared) byHub.set(h, [...(byHub.get(h) ?? []), c])
  const covered = new Set<string>()
  const clusters: HubCluster[] = []
  for (;;) {
    let best: { hub: string; pairs: LinkCandidate[] } | null = null
    for (const [hub, list] of byHub) {
      const open = list.filter((c) => !covered.has(pairKey(c.a, c.b)))
      if (!best || open.length > best.pairs.length || (open.length === best.pairs.length && hub < best.hub)) best = { hub, pairs: open }
    }
    if (!best || best.pairs.length === 0) break
    for (const c of best.pairs) covered.add(pairKey(c.a, c.b))
    const members = [...new Set(best.pairs.flatMap((c) => [c.a, c.b]))]
    const family = best.pairs.filter((c) => c.type === 'FAMILY').length
    clusters.push({
      hub: best.hub,
      members,
      pairs: best.pairs.map((c) => [c.a, c.b]),
      type: family * 2 >= best.pairs.length ? 'FAMILY' : 'FRIEND',
    })
  }
  return clusters
}

/** Forbindelsene en innsikt står for: alle par i gruppen, eller navet til hver. */
export function insightPairs(kind: 'group' | 'hub', hubId: string | null, members: string[]): [string, string][] {
  const unique = [...new Set(members)].filter((id) => id !== hubId)
  if (kind === 'hub') return hubId ? unique.map((m) => [hubId, m]) : []
  const pairs: [string, string][] = []
  for (let i = 0; i < unique.length; i++) for (let j = i + 1; j < unique.length; j++) pairs.push([unique[i], unique[j]])
  return pairs
}
