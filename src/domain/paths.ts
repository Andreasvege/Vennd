// Stier mellom personer, bare gjennom relasjonene mellom andre. «Deg» er
// aldri med: alle du kjenner er to steg fra hverandre via deg, og det er
// ikke nyheter.

type Edge = [string, string]

function adjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const [a, b] of edges) {
    adj.set(a, [...(adj.get(a) ?? []), b])
    adj.set(b, [...(adj.get(b) ?? []), a])
  }
  return adj
}

/** Bredde-først fra én person: avstand og forrige steg for alle som nås. */
function explore(adj: Map<string, string[]>, from: string, maxHops: number) {
  const dist = new Map<string, number>([[from, 0]])
  const prev = new Map<string, string>()
  const queue = [from]
  while (queue.length) {
    const node = queue.shift()!
    const d = dist.get(node)!
    if (d === maxHops) continue
    for (const next of adj.get(node) ?? []) {
      if (dist.has(next)) continue
      dist.set(next, d + 1)
      prev.set(next, node)
      queue.push(next)
    }
  }
  return { dist, prev }
}

function walkBack(prev: Map<string, string>, from: string, to: string): string[] {
  const path = [to]
  while (path[0] !== from) path.unshift(prev.get(path[0])!)
  return path
}

/** Korteste vei fra `from` til `to`, som en liste med personer. null hvis lenger enn maxHops. */
export function shortestPath(edges: Edge[], from: string, to: string, maxHops = 4): string[] | null {
  const { dist, prev } = explore(adjacency(edges), from, maxHops)
  return dist.has(to) ? walkBack(prev, from, to) : null
}

/**
 * Par som kom nærmere hverandre da `after` erstattet `before`, der minst én
 * er interessant (du dater dem, eller de dater noen). Direkte naboer
 * utelates — det har du nettopp selv skrevet inn.
 */
export function newProximities(
  before: Edge[],
  after: Edge[],
  interesting: Set<string>,
  maxHops = 3,
): { a: string; b: string; path: string[] }[] {
  const adjBefore = adjacency(before)
  const adjAfter = adjacency(after)
  const out = new Map<string, { a: string; b: string; path: string[] }>()

  for (const a of interesting) {
    const now = explore(adjAfter, a, maxHops)
    const then = explore(adjBefore, a, maxHops)
    for (const [b, d] of now.dist) {
      if (d < 2) continue
      const earlier = then.dist.get(b)
      if (earlier !== undefined && earlier <= d) continue
      // Samme par to ganger (begge interessante): behold én, i fast rekkefølge.
      const key = interesting.has(b) ? [a, b].sort().join('|') : `${a}|${b}`
      if (!out.has(key)) out.set(key, { a, b, path: walkBack(now.prev, a, b) })
    }
  }
  return [...out.values()]
}
