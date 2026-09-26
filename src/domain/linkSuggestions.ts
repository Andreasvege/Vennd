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

export type Assessment = { n: number; keep: boolean; type: RelationshipType; label: string | null; reason: string }

/**
 * Claudes svar til rader: nummeret peker på kandidaten i lista Claude fikk.
 * Ukjente nummer ignoreres, og tekstene kuttes til det skjermen tåler.
 */
export function resolveAssessments(numbered: LinkCandidate[], out: Assessment[]) {
  const seen = new Set<number>()
  return out.flatMap((x) => {
    const c = numbered[x.n - 1]
    if (!c || seen.has(x.n)) return []
    seen.add(x.n)
    const label = x.label?.trim().slice(0, 40) || null
    return [{ aId: c.a, bId: c.b, keep: x.keep, type: x.type, label, reason: x.reason.trim().slice(0, 200) || null }]
  })
}
