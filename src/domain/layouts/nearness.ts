import { angleWithin, sectors } from './sectors'
import { polar, type Group, type LayoutPerson, type Point } from './types'

export const NEARNESS_DEFAULTS = { rMin: 140, rMax: 520 }

/** Bakgrunnsringene i Nærhet: innerst, midt og ytterst. */
export function nearnessRings({ rMin, rMax } = NEARNESS_DEFAULTS) {
  return [
    { r: rMin, label: 'recent' as const },
    { r: (rMin + rMax) / 2, label: 'while' as const },
    { r: rMax, label: 'long' as const },
  ]
}

/**
 * Nærhet: vinkelen er gruppen (hovedtaggen), avstanden er hvor fersk
 * kontakten er. Deg i midten; de du nettopp har sett, innerst.
 */
export function nearness(persons: LayoutPerson[], groups: Group[], { rMin, rMax } = NEARNESS_DEFAULTS): Map<string, Point> {
  const fresh = new Map(persons.map((p) => [p.id, p.freshness]))
  const out = new Map<string, Point>()
  for (const s of sectors(groups, persons)) {
    s.members.forEach((id, i) => {
      const r = rMin + (1 - (fresh.get(id) ?? 0)) * (rMax - rMin)
      out.set(id, polar(r, angleWithin(s, i)))
    })
  }
  return out
}
