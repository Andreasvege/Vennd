import { todayISO } from './format'

type PlanLike = { id: string; at: Date; hasTime: boolean; status: 'PLANNED' | 'DONE' | 'CANCELLED' }

const DAY_MS = 86_400_000
const WINDOW_DAYS = 7
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/**
 * Planer som kommer (fra nå og en uke fram) og planer som har vært, men
 * ikke er logget ennå («Hvordan gikk det?»). Et treff med klokkeslett er
 * passert når klokka har passert; uten klokkeslett varer det dagen ut.
 */
export function splitPlans<P extends PlanLike>(plans: P[], now: Date = new Date()) {
  const today = startOfDay(now)
  const horizon = new Date(today.getTime() + (WINDOW_DAYS + 1) * DAY_MS)
  const planned = plans.filter((p) => p.status === 'PLANNED')
  const isPast = (p: P) => (p.hasTime ? p.at < now : startOfDay(p.at) < today)
  return {
    upcoming: planned.filter((p) => !isPast(p) && p.at < horizon).sort((a, b) => a.at.getTime() - b.at.getTime()),
    awaiting: planned.filter(isPast).sort((a, b) => b.at.getTime() - a.at.getTime()),
  }
}

export type DueChoice = 'none' | 'week' | 'month' | string

/** «Ta opp igjen»: fra valget i skriv-arket til en dato (YYYY-MM-DD), eller null. */
export function dueFrom(choice: DueChoice, now: Date = new Date()): string | null {
  if (choice === 'none') return null
  if (choice === 'week') return todayISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7))
  if (choice === 'month') return todayISO(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()))
  return /^\d{4}-\d{2}-\d{2}$/.test(choice) ? choice : null
}
