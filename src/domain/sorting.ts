import { DEFAULT_CADENCE_WEEKS } from './cadence'
import type { RelationshipType } from '@/types'

export type DeckPerson = { id: string; name: string; logCount: number; hasBirthday: boolean; email: string | null }

const collator = new Intl.Collator('nb')

/**
 * Rekkefølgen i kortstokken: de som mest sannsynlig betyr noe først. Folk
 * du har logget med, så de du vet bursdagen til, så resten alfabetisk.
 */
export function deckOrder(persons: DeckPerson[]): string[] {
  const rank = (p: DeckPerson) => (p.logCount > 0 ? 0 : p.hasBirthday ? 1 : 2)
  return [...persons]
    .sort((a, b) => rank(a) - rank(b) || b.logCount - a.logCount || collator.compare(a.name, b.name))
    .map((p) => p.id)
}

// Postkasser alle har; samme domene her sier ingenting om hvem man er.
const COMMON_DOMAINS = new Set(['gmail.com', 'hotmail.com', 'outlook.com', 'live.no', 'icloud.com', 'yahoo.com', 'online.no', 'me.com'])

const lastName = (name: string) => {
  const parts = name.trim().toLocaleLowerCase('nb').split(/\s+/)
  return parts.length > 1 ? parts.at(-1)! : null
}
const domain = (email: string | null) => {
  const d = email?.toLowerCase().split('@')[1]
  return d && !COMMON_DOMAINS.has(d) ? d : null
}

/**
 * Etter at noen er sortert: flytt folk med samme etternavn (ofte familie)
 * eller samme e-postdomene (ofte kolleger) fram i køen, mens de er friske
 * i minnet. Resten beholder rekkefølgen.
 */
export function pullRelated(queue: string[], just: DeckPerson, persons: DeckPerson[]): string[] {
  const byId = new Map(persons.map((p) => [p.id, p]))
  const last = lastName(just.name)
  const dom = domain(just.email)
  const related = (id: string) => {
    const p = byId.get(id)
    if (!p) return false
    return (last !== null && lastName(p.name) === last) || (dom !== null && domain(p.email) === dom)
  }
  return [...queue.filter(related), ...queue.filter((id) => !related(id))]
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Parene som faktisk er nye: ikke en person med seg selv, ikke et par som
 * finnes fra før (uansett retning), og hvert par bare én gang.
 */
export function newPairs(wanted: [string, string][], existing: [string, string][]): [string, string][] {
  const seen = new Set(existing.map(([a, b]) => pairKey(a, b)))
  const out: [string, string][] = []
  for (const [a, b] of wanted) {
    const key = pairKey(a, b)
    if (a === b || seen.has(key)) continue
    seen.add(key)
    out.push([a, b])
  }
  return out
}

/** Alle par i gruppa som ikke allerede har en relasjon, uansett retning. */
export function missingPairs(ids: string[], existing: [string, string][]): [string, string][] {
  const unique = [...new Set(ids)]
  const all: [string, string][] = []
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) all.push([unique[i], unique[j]])
  }
  return newPairs(all, existing)
}

export const CLOSENESS = ['close', 'family', 'sometimes', 'peripheral'] as const
export type Closeness = (typeof CLOSENESS)[number]

/** «Hvor nær?» som ett trykk: type og påminnelse i ett. Finjusteres på profilen. */
export function closenessPreset(choice: Closeness): { type: RelationshipType; cadenceWeeks: number | null } {
  switch (choice) {
    case 'close':
      return { type: 'FRIEND', cadenceWeeks: DEFAULT_CADENCE_WEEKS.FRIEND }
    case 'family':
      return { type: 'FAMILY', cadenceWeeks: DEFAULT_CADENCE_WEEKS.FAMILY }
    case 'sometimes':
      return { type: 'FRIEND', cadenceWeeks: 12 }
    case 'peripheral':
      return { type: 'ACQUAINTANCE', cadenceWeeks: null }
  }
}

/**
 * Hva nettverket allerede vet om personen på kortet: hvem hun er koblet
 * til, hvem de igjen kjenner (flest felles først), og miljøet de deler.
 * Etter første kort i en familie er resten av familien da ett trykk unna.
 */
export function networkHints(personId: string, pairs: [string, string][], tagsOf: Map<string, string[]>) {
  const neighbours = new Map<string, Set<string>>()
  for (const [a, b] of pairs) {
    if (a === b) continue
    if (!neighbours.has(a)) neighbours.set(a, new Set())
    if (!neighbours.has(b)) neighbours.set(b, new Set())
    neighbours.get(a)!.add(b)
    neighbours.get(b)!.add(a)
  }
  const already = [...(neighbours.get(personId) ?? [])]

  const counts = new Map<string, number>()
  for (const n of already) {
    for (const m of neighbours.get(n) ?? []) {
      if (m === personId || already.includes(m)) continue
      counts.set(m, (counts.get(m) ?? 0) + 1)
    }
  }
  const suggested = [...counts].sort((x, y) => y[1] - x[1]).map(([id]) => id)

  // Miljøet flertallet av dem hun kjenner er i.
  const tagCounts = new Map<string, number>()
  for (const n of already) for (const tag of tagsOf.get(n) ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  const tagIds = [...tagCounts].filter(([, c]) => c * 2 >= already.length && c > 0).map(([id]) => id)

  return { already, suggested, tagIds }
}
