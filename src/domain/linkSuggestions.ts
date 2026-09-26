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

// En som kjenner flere enn dette, er et knutepunkt (en kontaktsterk venn,
// hele radioen): at to begge kjenner henne, sier lite om dem.
const HUB_MAX = 12

export type ClusterSide = { key: string; label: string; ids: string[] }
export type GroupCluster = {
  key: string
  /** Én side: «Skumma: kjenner de hverandre?» To sider: «Skumma og Radio Nova». */
  a: ClusterSide
  b: ClusterSide | null
  pairs: [string, string][]
  /** De felles bekjente som sier mest (maks to), til begrunnelsen. */
  hubs: string[]
  sameSurname: boolean
  type: RelationshipType
}

type ClusterPerson = { id: string; name: string; groupId: string | null }

/**
 * Forslagene samlet etter miljø, så hvert kort er ett sammenhengende
 * spørsmål: «Skumma: kjenner de hverandre?» eller «Skumma og Radio Nova:
 * kjenner de hverandre?». Miljøet er hovedtaggen, ellers etternavnet når
 * flere deler det. Par som bare henger sammen via et knutepunkt (en som
 * kjenner nesten alle), tas ikke med: det er ikke et tegn på noe.
 */
export function groupClusters(
  candidates: LinkCandidate[],
  persons: ClusterPerson[],
  relations: LinkRelation[],
  groupNames: Map<string, string>,
): GroupCluster[] {
  const degree = new Map<string, number>()
  for (const r of relations) {
    degree.set(r.from, (degree.get(r.from) ?? 0) + 1)
    degree.set(r.to, (degree.get(r.to) ?? 0) + 1)
  }
  const byId = new Map(persons.map((p) => [p.id, p]))
  const surnameCount = new Map<string, number>()
  for (const p of persons) {
    const s = surname(p.name)
    if (s) surnameCount.set(s, (surnameCount.get(s) ?? 0) + 1)
  }
  const sideOf = (id: string): { key: string; label: string } => {
    const p = byId.get(id)
    if (p?.groupId && groupNames.has(p.groupId)) return { key: `tag:${p.groupId}`, label: groupNames.get(p.groupId)! }
    const s = p ? surname(p.name) : null
    if (s && (surnameCount.get(s) ?? 0) > 1) {
      const shown = p!.name.trim().split(/\s+/).at(-1)!
      return { key: `surname:${s}`, label: shown }
    }
    return { key: 'none', label: '' }
  }

  const clusters = new Map<string, { a: ClusterSide; b: ClusterSide | null; pairs: [string, string][]; hubCount: Map<string, number>; same: number; family: number }>()
  for (const c of candidates) {
    const telling = c.shared.filter((h) => (degree.get(h) ?? 0) <= HUB_MAX)
    // Samme etternavn er et tegn i seg selv; ellers trengs en felles bekjent som sier noe.
    if (!c.sameSurname && telling.length === 0) continue
    if (!c.sameSurname && telling.length < 2 && c.sharedTags.length === 0) continue
    const [sa, sb] = [sideOf(c.a), sideOf(c.b)].sort((x, y) => x.key.localeCompare(y.key))
    const [ida, idb] = sideOf(c.a).key === sa.key ? [c.a, c.b] : [c.b, c.a]
    const within = sa.key === sb.key
    const key = within ? sa.key : `${sa.key}|${sb.key}`
    if (!clusters.has(key)) {
      clusters.set(key, {
        a: { ...sa, ids: [] },
        b: within ? null : { ...sb, ids: [] },
        pairs: [],
        hubCount: new Map(),
        same: 0,
        family: 0,
      })
    }
    const k = clusters.get(key)!
    k.pairs.push([c.a, c.b])
    if (!k.a.ids.includes(ida)) k.a.ids.push(ida)
    const other = within ? k.a : k.b!
    if (!other.ids.includes(idb)) other.ids.push(idb)
    for (const h of telling) k.hubCount.set(h, (k.hubCount.get(h) ?? 0) + 1)
    if (c.sameSurname) k.same++
    if (c.type === 'FAMILY') k.family++
  }

  return [...clusters]
    .map(([key, k]) => ({
      key,
      a: k.a,
      b: k.b,
      pairs: k.pairs,
      hubs: [...k.hubCount].sort((x, y) => y[1] - x[1]).slice(0, 2).map(([id]) => id),
      sameSurname: k.same * 2 >= k.pairs.length,
      type: (k.family * 2 >= k.pairs.length || k.same * 2 >= k.pairs.length ? 'FAMILY' : 'FRIEND') as RelationshipType,
    }))
    .sort((x, y) => y.pairs.length - x.pairs.length || x.key.localeCompare(y.key))
}

/** Forbindelsene en innsikt står for: alle par i gruppen, eller navet til hver. */
export function insightPairs(kind: 'group' | 'hub', hubId: string | null, members: string[]): [string, string][] {
  const unique = [...new Set(members)].filter((id) => id !== hubId)
  if (kind === 'hub') return hubId ? unique.map((m) => [hubId, m]) : []
  const pairs: [string, string][] = []
  for (let i = 0; i < unique.length; i++) for (let j = i + 1; j < unique.length; j++) pairs.push([unique[i], unique[j]])
  return pairs
}
