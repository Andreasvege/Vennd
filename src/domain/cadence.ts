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
 * «Hvor ofte vil du holde kontakten?»: de samme valgene overalt (kortstokken,
 * ny person, redigering). Uker mellom påminnelser.
 */
export const CADENCE_WEEKS = [1, 2, 4, 12, 26, 52] as const

/**
 * Nærmeste valg; en eldre verdi (3, 6, 8 uker) vises som den som ligger
 * nærmest. Uavgjort: det sjeldneste, som defaultCadence i kortstokken. En
 * påminnelse for lite er bedre enn mas.
 */
export function nearestCadence(weeks: number): (typeof CADENCE_WEEKS)[number] {
  return CADENCE_WEEKS.reduce((best, w) => (Math.abs(w - weeks) <= Math.abs(best - weeks) ? w : best))
}
