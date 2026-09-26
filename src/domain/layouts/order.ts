/**
 * Rekkefølgen innenfor en gruppe: de som henger sammen, står ved siden av
 * hverandre. Hver sammenhengende klynge går etter tur (størst først), fra
 * den som kjenner flest, bredde først; de uten forbindelser står sist,
 * alfabetisk. Alt er deterministisk, så kartet ikke hopper fra dag til dag.
 */
export function connectionOrder(members: { id: string; name: string }[], pairs: [string, string][]): string[] {
  const ids = new Set(members.map((m) => m.id))
  const name = new Map(members.map((m) => [m.id, m.name]))
  const byName = (a: string, b: string) => name.get(a)!.localeCompare(name.get(b)!, 'nb')
  const adj = new Map<string, Set<string>>(members.map((m) => [m.id, new Set()]))
  for (const [a, b] of pairs) {
    if (a === b || !ids.has(a) || !ids.has(b)) continue
    adj.get(a)!.add(b)
    adj.get(b)!.add(a)
  }
  const degree = (id: string) => adj.get(id)!.size

  const seen = new Set<string>()
  const clusters: string[][] = []
  for (const start of [...ids].filter((id) => degree(id) > 0).sort((a, b) => degree(b) - degree(a) || byName(a, b))) {
    if (seen.has(start)) continue
    const cluster: string[] = []
    const queue = [start]
    seen.add(start)
    while (queue.length) {
      const id = queue.shift()!
      cluster.push(id)
      for (const next of [...adj.get(id)!].sort((a, b) => degree(b) - degree(a) || byName(a, b))) {
        if (seen.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }
    clusters.push(cluster)
  }
  clusters.sort((a, b) => b.length - a.length || byName(a[0], b[0]))
  const loners = [...ids].filter((id) => degree(id) === 0).sort(byName)
  return [...clusters.flat(), ...loners]
}
