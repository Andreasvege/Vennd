const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Par som ofte er med i samme logg, men som ingen har registrert en
 * relasjon mellom. «Ingrid og Martin har vært med tre ganger» er en
 * relasjon du ikke har skrevet inn ennå.
 */
export function derivePairs(
  logs: { personIds: string[] }[],
  existing: [string, string][],
  min = 2,
): { a: string; b: string; count: number }[] {
  const known = new Set(existing.map(([a, b]) => pairKey(a, b)))
  const counts = new Map<string, number>()
  for (const { personIds } of logs) {
    const ids = [...new Set(personIds)].sort()
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = pairKey(ids[i], ids[j])
        if (!known.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  return [...counts]
    .filter(([, n]) => n >= min)
    .map(([key, count]) => {
      const [a, b] = key.split('|')
      return { a, b, count }
    })
    .sort((x, y) => y.count - x.count || x.a.localeCompare(y.a))
}
