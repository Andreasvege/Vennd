import type { Group, LayoutPerson } from './types'

export type Sector = { groupId: string | null; start: number; end: number; members: string[] }

const GAP = 0.06
const TAU = Math.PI * 2

/**
 * Deler sirkelen mellom gruppene, i fast rekkefølge og etter hvor mange
 * de er, med litt luft mellom. Tomme grupper tar ingen plass. Medlemmene
 * sorteres alfabetisk, så plasseringen er stabil fra dag til dag.
 */
export function sectors(groups: Group[], persons: LayoutPerson[]): Sector[] {
  const order = [...groups.filter((g) => g.id !== null).map((g) => g.id), null]
  const byGroup = new Map<string | null, LayoutPerson[]>(order.map((id) => [id, []]))
  for (const p of persons) {
    const key = byGroup.has(p.groupId) ? p.groupId : null
    byGroup.get(key)!.push(p)
  }
  const filled = order
    .map((id) => ({ id, members: byGroup.get(id)!.sort((a, b) => a.name.localeCompare(b.name, 'nb')) }))
    .filter((g) => g.members.length > 0)
  if (filled.length === 0) return []

  const total = filled.reduce((n, g) => n + g.members.length, 0)
  const gaps = filled.length > 1 ? filled.length * GAP : 0
  const usable = TAU - gaps
  let cursor = filled.length > 1 ? GAP / 2 : 0
  return filled.map((g) => {
    const size = (usable * g.members.length) / total
    const sector = { groupId: g.id, start: cursor, end: cursor + size, members: g.members.map((m) => m.id) }
    cursor += size + (filled.length > 1 ? GAP : 0)
    return sector
  })
}

/** Jevnt fordelt inni sektoren, med halv plass i hver ende. */
export const angleWithin = (s: Sector, index: number) =>
  s.start + ((index + 0.5) / s.members.length) * (s.end - s.start)
