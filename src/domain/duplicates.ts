import { fold } from './search'

/**
 * Navnet slik vi sammenligner det: små bokstaver, uten aksenter, og med
 * bindestrek som mellomrom. «Nora Broby-Bergem» og «Nora Broby Bergem»
 * er da like.
 */
export function normalizeName(name: string): string {
  return fold(name)
    .replace(/[-‐‑–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type DuplicatePair = { a: string; b: string; reason: 'same' | 'middle' }

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Personer som trolig er den samme: likt navn når bindestrek og aksenter
 * ses bort fra, eller samme for- og etternavn der det ene navnet bare
 * mangler et mellomnavn («Solveig Lunde» og «Solveig Jørpeland Lunde»).
 * Par du har sagt ikke er samme person, hoppes over.
 */
export function findDuplicates(persons: { id: string; name: string }[], notSame: Set<string> = new Set()): DuplicatePair[] {
  const byEnds = new Map<string, { id: string; tokens: string[]; norm: string }[]>()
  for (const p of persons) {
    const norm = normalizeName(p.name)
    const tokens = norm.split(' ')
    if (tokens.length < 2) continue
    const ends = `${tokens[0]} ${tokens.at(-1)}`
    byEnds.set(ends, [...(byEnds.get(ends) ?? []), { id: p.id, tokens, norm }])
  }
  const out: DuplicatePair[] = []
  for (const group of byEnds.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const [x, y] = [group[i], group[j]]
        if (notSame.has(key(x.id, y.id))) continue
        if (x.norm === y.norm) {
          out.push({ a: x.id, b: y.id, reason: 'same' })
          continue
        }
        const [short, long] = x.tokens.length <= y.tokens.length ? [x, y] : [y, x]
        if (short.tokens.length < long.tokens.length && short.tokens.every((tk) => long.tokens.includes(tk))) {
          out.push({ a: x.id, b: y.id, reason: 'middle' })
        }
      }
    }
  }
  return out
}
