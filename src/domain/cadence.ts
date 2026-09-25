import type { RelationshipType } from '@/types'

// Profil «Tett», valgt 2026-09-06. Tallet er antall uker uten kontakt før
// appen sier fra. Erstatter den globale WEEKS_THRESHOLD = 3, som ga
// partneren din og en fjern bekjent nøyaktig samme behandling.
//
// Person.cadenceWeeks kan overstyre dette per person, og null der betyr
// eksplisitt «aldri auto-påminn» — for folk du har kartlagt uten å ha
// tenkt å holde kontakten.
export const DEFAULT_CADENCE_WEEKS: Record<RelationshipType, number> = {
  ROMANTIC: 1,
  FAMILY: 3,
  FRIEND: 4,
  COLLEAGUE: 8,
  ACQUAINTANCE: 26,
  OTHER: 12,
}

export function defaultCadenceFor(type: RelationshipType): number {
  return DEFAULT_CADENCE_WEEKS[type]
}

/**
 * Siste kontakt per person, fra logger som kan ha flere deltakere. En
 * middag med Ingrid og Martin teller for begge.
 */
export function lastContactByPerson(
  entries: { date: Date; personIds: string[] }[],
): Map<string, Date> {
  const out = new Map<string, Date>()
  for (const entry of entries) {
    for (const id of entry.personIds) {
      const prev = out.get(id)
      if (!prev || entry.date > prev) out.set(id, entry.date)
    }
  }
  return out
}
