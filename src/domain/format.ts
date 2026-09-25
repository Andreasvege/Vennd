import { t } from '@/i18n'

const LOCALE = 'nb-NO'
const DAY_MS = 86_400_000

// Kalenderdager i lokal tid: midnatt til midnatt, ikke 24-timersvinduer.
// En logg fra 23:50 er «i går» kl. 00:30, selv om det bare er 40 minutter.
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** «i dag», «i går», «4 dager siden», ellers en dato (med år hvis ikke i år). */
export function relativeDay(date: Date, now: Date = new Date()): string {
  // Math.round tåler sommertid, der et døgn er 23 eller 25 timer.
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (days === 0) return t.time.today
  if (days === 1) return t.time.yesterday
  if (days > 1 && days < 7) return t.time.daysAgo(days)

  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: sameYear ? 'long' : 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Dagens dato som YYYY-MM-DD i lokal tid — verdien et <input type="date"> vil ha. */
export function todayISO(now: Date = new Date()): string {
  // sv-SE formaterer som YYYY-MM-DD. toISOString() er UTC og ga gårsdagen
  // for alt logget mellom midnatt og 02:00 norsk sommertid.
  return now.toLocaleDateString('sv-SE')
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
