/**
 * Første forekomst av hver id. Brukes der en person du nettopp la til,
 * står både i en lokal liste og (etter at siden er hentet på nytt) i
 * dataene fra serveren — ellers ville hun vist to ganger.
 */
export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)))
}
