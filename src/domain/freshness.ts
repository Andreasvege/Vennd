const WEEK_MS = 7 * 86_400_000
/** Målet for folk uten påminnelser: de kan også falme, bare saktere. */
const NO_CADENCE_WEEKS = 26

/**
 * Hvor fersk kontakten er, fra 1 (nylig) til 0 (lenge siden, eller aldri),
 * målt mot personens egen kadens. 1 innen halve kadensen, så lineært ned
 * til 0 ved tre ganger kadensen. Brukes til avstand i Nærhet og til
 * falming i alle syn.
 */
export function freshness(lastContact: Date | null, cadenceWeeks: number | null, now: Date = new Date()): number {
  if (!lastContact) return 0
  const cadence = cadenceWeeks ?? NO_CADENCE_WEEKS
  const weeks = (now.getTime() - lastContact.getTime()) / WEEK_MS
  const fresh = cadence / 2
  const gone = cadence * 3
  if (weeks <= fresh) return 1
  if (weeks >= gone) return 0
  return 1 - (weeks - fresh) / (gone - fresh)
}

/** Nodens opasitet: aldri usynlig, bare dempet. */
export const fadeFor = (f: number) => 0.35 + 0.65 * f
