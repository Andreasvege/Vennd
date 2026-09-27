// «Fyll inn kartet»: hva som mangler om folk som allerede står på kartet,
// og i hvilken rekkefølge det er verdt å gå gjennom dem.

/** Det et kort kan spørre om, i den rekkefølgen kortet viser det. */
export const GAPS = ['seen', 'who', 'group', 'knows', 'birthday', 'facts'] as const
export type Gap = (typeof GAPS)[number]

export type EnrichPerson = {
  id: string
  name: string
  relationLabel: string | null
  cadenceWeeks: number | null
  tagIds: string[]
  birthday: Date | string | null
  /** Fakta du har skrevet selv; telefon og e-post fra importen teller ikke. */
  factCount: number
  relationshipCount: number
  lastContact: Date | string | null
}

/** Hva vi ikke vet om personen ennå. */
export function gapsOf(p: EnrichPerson): Gap[] {
  const missing: Record<Gap, boolean> = {
    seen: p.lastContact === null,
    who: !p.relationLabel,
    group: p.tagIds.length === 0,
    knows: p.relationshipCount === 0,
    birthday: p.birthday === null,
    facts: p.factCount === 0,
  }
  return GAPS.filter((g) => missing[g])
}

/**
 * Rekkefølgen: de du vil ha tettest kontakt med først (kortest kadens), så
 * de det mangler mest om, så alfabetisk. De det ikke mangler noe om, er
 * ikke med. Deterministisk, så stokken er den samme om du går og kommer
 * tilbake.
 */
export function enrichOrder(persons: EnrichPerson[]): string[] {
  const gaps = new Map(persons.map((p) => [p.id, gapsOf(p).length]))
  return persons
    .filter((p) => gaps.get(p.id)! > 0)
    .sort(
      (a, b) =>
        (a.cadenceWeeks ?? 99) - (b.cadenceWeeks ?? 99) ||
        gaps.get(b.id)! - gaps.get(a.id)! ||
        a.name.localeCompare(b.name, 'nb'),
    )
    .map((p) => p.id)
}

/** «Når så dere hverandre sist?», som et omtrentlig antall dager tilbake. */
export const SEEN_CHOICES = ['week', 'month', 'year', 'longer'] as const
export type SeenChoice = (typeof SEEN_CHOICES)[number]
const SEEN_DAYS: Record<SeenChoice, number> = { week: 3, month: 15, year: 120, longer: 540 }

/** Datoen (YYYY-MM-DD) et anslag svarer til, regnet fra i dag. */
export function seenDate(choice: SeenChoice, today: Date): string {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - SEEN_DAYS[choice])
  return d.toISOString().slice(0, 10)
}
