import type { RomanticPhase } from '@prisma/client'

/** Stegene framover. ENDED er en utgang fra hvilken som helst fase, ikke et steg. */
export const ROMANCE_ORDER: RomanticPhase[] = ['FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER']

export function currentPhase(entries: { phase: RomanticPhase; at: Date }[]): RomanticPhase | null {
  if (entries.length === 0) return null
  return entries.reduce((a, b) => (b.at.getTime() >= a.at.getTime() ? b : a)).phase
}

/** Neste steg framover. null når det ikke finnes et (PARTNER, ENDED). */
export function nextPhase(current: RomanticPhase | null): RomanticPhase | null {
  if (current === null) return 'FIRST_DATE'
  const i = ROMANCE_ORDER.indexOf(current)
  return i === -1 || i === ROMANCE_ORDER.length - 1 ? null : ROMANCE_ORDER[i + 1]
}
