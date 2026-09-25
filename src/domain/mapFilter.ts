import { z } from 'zod'
import type { RelationshipType } from '@/types'

export type MapFilter = {
  /** Tagger som er skrudd av, som kalendere. */
  hiddenTags: string[]
  showUntagged: boolean
  hideRomanticEdges: boolean
  /** Avsluttede relasjoner. */
  showHistorical: boolean
  /** Utledet fra felles logger. */
  showDerived: boolean
}

export const DEFAULT_FILTER: MapFilter = {
  hiddenTags: [],
  showUntagged: true,
  hideRomanticEdges: false,
  showHistorical: true,
  showDerived: true,
}

/**
 * Et filter fra localStorage eller databasen er ikke til å stole på: felt
 * kan mangle, ha feil type eller peke på tagger som er slettet. Hvert felt
 * leses for seg, og det som ikke gir mening, får standardverdien.
 */
export function normalize(raw: unknown, knownTagIds: string[]): MapFilter {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const bool = (key: keyof MapFilter) => {
    const parsed = z.boolean().safeParse(obj[key])
    return parsed.success ? parsed.data : (DEFAULT_FILTER[key] as boolean)
  }
  const known = new Set(knownTagIds)
  const tags = z.array(z.string()).safeParse(obj.hiddenTags)
  return {
    hiddenTags: tags.success ? [...new Set(tags.data.filter((id) => known.has(id)))] : [],
    showUntagged: bool('showUntagged'),
    hideRomanticEdges: bool('hideRomanticEdges'),
    showHistorical: bool('showHistorical'),
    showDerived: bool('showDerived'),
  }
}

export function activeCount(f: MapFilter): number {
  return (
    f.hiddenTags.length +
    Number(!f.showUntagged) +
    Number(f.hideRomanticEdges) +
    Number(!f.showHistorical) +
    Number(!f.showDerived)
  )
}

/** Synlig hvis minst én av taggene er på — som en avtale i flere kalendere. */
export function isPersonVisible(p: { tagIds: string[] }, f: MapFilter): boolean {
  if (p.tagIds.length === 0) return f.showUntagged
  return p.tagIds.some((id) => !f.hiddenTags.includes(id))
}

export function isEdgeVisible(
  e: { type: RelationshipType; until: Date | null; derived?: boolean },
  visible: Set<string>,
  from: string,
  to: string,
  f: MapFilter,
): boolean {
  if (!visible.has(from) || !visible.has(to)) return false
  if (e.derived) return f.showDerived
  if (e.type === 'ROMANTIC' && f.hideRomanticEdges) return false
  if (e.until && !f.showHistorical) return false
  return true
}
