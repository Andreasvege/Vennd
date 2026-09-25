const DAY_MS = 86_400_000
const WEEK_MS = 7 * DAY_MS

const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / DAY_MS)

/**
 * «Hvem har du ikke sett?»: alle som ikke har vært med i en logg de siste
 * tre månedene, i bånd etter hvor lenge siden det er, lengst siden først.
 */
export function unseenBands<P extends { lastContact: Date | null }>(persons: P[], now: Date = new Date()) {
  const bands = { year: [] as P[], half: [] as P[], quarter: [] as P[], never: [] as P[] }
  for (const p of persons) {
    if (!p.lastContact) {
      bands.never.push(p)
      continue
    }
    const days = daysBetween(p.lastContact, now)
    if (days > 365) bands.year.push(p)
    else if (days > 182) bands.half.push(p)
    else if (days >= 90) bands.quarter.push(p)
  }
  const oldestFirst = (a: P, b: P) => a.lastContact!.getTime() - b.lastContact!.getTime()
  bands.year.sort(oldestFirst)
  bands.half.sort(oldestFirst)
  bands.quarter.sort(oldestFirst)
  return bands
}

/**
 * Hvor mange logger hvert miljø (hovedtagg) var med i. En logg med folk
 * fra to miljøer teller for begge: kvelden var med begge.
 */
export function byPrimaryTag(logs: { personIds: string[] }[], primaryOf: Map<string, string | null>) {
  const counts = new Map<string | null, number>()
  for (const log of logs) {
    const tags = new Set(log.personIds.map((id) => primaryOf.get(id) ?? null))
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tagId, count]) => ({ tagId, count }))
    .sort((a, b) => b.count - a.count || Number(a.tagId === null) - Number(b.tagId === null))
}

/** Antall logger per type. Logger uten type telles som «annet». */
export function byType<T extends string>(logs: { type: T | null }[]) {
  const counts: Partial<Record<T | 'OTHER', number>> = {}
  for (const { type } of logs) {
    const key = type ?? 'OTHER'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

/** De du har sett oftest, med datoene (eldste først) så rytmen kan regnes. */
export function topPeople(logs: { date: Date; personIds: string[] }[], limit = 8) {
  const byPerson = new Map<string, Date[]>()
  for (const log of [...logs].sort((a, b) => a.date.getTime() - b.date.getTime())) {
    for (const id of log.personIds) byPerson.set(id, [...(byPerson.get(id) ?? []), log.date])
  }
  return [...byPerson]
    .map(([personId, dates]) => ({ personId, count: dates.length, dates }))
    .sort((a, b) => b.count - a.count || b.dates.at(-1)!.getTime() - a.dates.at(-1)!.getTime())
    .slice(0, limit)
}

// Mandag 00:00 UTC i uken datoen ligger i.
function mondayOf(d: Date) {
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return new Date(midnight - ((d.getUTCDay() + 6) % 7) * DAY_MS)
}

// ISO-ukenummer: uken som inneholder årets første torsdag er uke 1.
function isoWeek(monday: Date) {
  const thursday = new Date(monday.getTime() + 3 * DAY_MS)
  const jan1 = Date.UTC(thursday.getUTCFullYear(), 0, 1)
  return Math.floor((thursday.getTime() - jan1) / WEEK_MS) + 1
}

/** Antall logger per uke (mandag–søndag, UTC) fra og med `from` til og med `to`. Tomme uker er med. */
export function weekly(logs: { date: Date }[], from: Date, to: Date) {
  const weeks: { start: Date; week: number; count: number }[] = []
  for (let t = mondayOf(from).getTime(); t <= to.getTime(); t += WEEK_MS) {
    const start = new Date(t)
    weeks.push({ start, week: isoWeek(start), count: 0 })
  }
  const first = weeks[0]?.start.getTime() ?? 0
  for (const { date } of logs) {
    const i = Math.floor((mondayOf(date).getTime() - first) / WEEK_MS)
    if (i >= 0 && i < weeks.length) weeks[i].count++
  }
  return weeks
}

const RHYTHM_LOGS = 10

/**
 * Hvor ofte dere ses, i dager: medianen av intervallene mellom de siste ti
 * dagene dere hadde kontakt. Medianen tåler en ferie; snittet ville ikke det.
 * Null når det er for lite å si noe om (under tre ulike dager).
 */
export function rhythm(dates: Date[]): number | null {
  const days = [...new Set(dates.map((d) => Math.floor(d.getTime() / DAY_MS)))].sort((a, b) => a - b).slice(-RHYTHM_LOGS)
  if (days.length < 3) return null
  const gaps = days.slice(1).map((d, i) => d - days[i]).sort((a, b) => a - b)
  const mid = gaps.length / 2
  return gaps.length % 2 ? gaps[Math.floor(mid)] : Math.round((gaps[mid - 1] + gaps[mid]) / 2)
}
