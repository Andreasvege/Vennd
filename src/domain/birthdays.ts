const DAY_MS = 86_400_000
/** År før dette betyr «ukjent år»: alder vises ikke. */
const UNKNOWN_YEAR_BEFORE = 1901

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Bursdagen i et gitt år. 29. februar feires 28. februar når året ikke har den.
function occurrence(month: number, day: number, year: number): Date {
  const d = new Date(year, month, day)
  return d.getMonth() === month ? d : new Date(year, month, day - 1)
}

/**
 * Neste bursdag, regnet i lokal kalender. Fødselsdatoen er lagret som en
 * dato (UTC), så dag og måned leses derfra.
 */
export function nextBirthday(birthday: Date, now: Date = new Date()) {
  const month = birthday.getUTCMonth()
  const day = birthday.getUTCDate()
  const today = startOfDay(now)
  let date = occurrence(month, day, today.getFullYear())
  if (date < today) date = occurrence(month, day, today.getFullYear() + 1)
  const born = birthday.getUTCFullYear()
  return {
    date,
    inDays: Math.round((date.getTime() - today.getTime()) / DAY_MS),
    turns: born < UNKNOWN_YEAR_BEFORE ? null : date.getFullYear() - born,
  }
}

/** Bursdager de neste `days` dagene, nærmest først. */
export function upcomingBirthdays<P extends { birthday: Date | null }>(persons: P[], now: Date = new Date(), days = 14) {
  return persons
    .filter((p): p is P & { birthday: Date } => p.birthday !== null)
    .map((p) => ({ ...p, next: nextBirthday(p.birthday, now) }))
    .filter((p) => p.next.inDays <= days)
    .sort((a, b) => a.next.inDays - b.next.inDays)
}
