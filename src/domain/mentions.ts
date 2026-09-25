// Hvem snakker teksten om? Brukes av skriv-arket til å foreslå deltakere
// mens du skriver «middag med Ingrid og Martin».
//
// Reglene er valgt for å heller foreslå for lite enn for mye:
// - Fullt navn treffer uansett store og små bokstaver.
// - Et fornavn alene treffer bare med stor forbokstav, så «tur i mai»
//   ikke blir til Mai Berg.
// - Et fornavn flere har, blir et spørsmål (maybe), aldri et valg.

type Person = { id: string; name: string }
export type Mentions = { sure: string[]; maybe: { word: string; ids: string[] }[] }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Ordgrense som forstår æ, ø, å og andre bokstaver; genitiv er lov.
const wordPattern = (words: string) =>
  new RegExp(`(?<!\\p{L})${escape(words).replace(/\s+/g, '\\s+')}(?:s|['’]s)?(?!\\p{L})`, 'giu')

const words = (name: string) => name.trim().split(/\s+/)

export function findMentions(text: string, persons: Person[]): Mentions {
  const hits: { index: number; id: string }[] = []
  const covered: [number, number][] = []
  const isCovered = (start: number, end: number) => covered.some(([s, e]) => start < e && end > s)

  // 1. Fulle navn (og ettordsnavn som «Mamma») — sikre treff.
  for (const p of persons) {
    for (const m of text.matchAll(wordPattern(p.name))) {
      hits.push({ index: m.index, id: p.id })
      covered.push([m.index, m.index + m[0].length])
    }
  }
  const surelyNamed = new Set(hits.map((h) => h.id))

  // 2. Fornavn for navn med flere ord, gruppert: flere med samme fornavn?
  const byFirst = new Map<string, Person[]>()
  for (const p of persons) {
    const parts = words(p.name)
    if (parts.length < 2) continue
    const key = parts[0].toLocaleLowerCase('nb')
    byFirst.set(key, [...(byFirst.get(key) ?? []), p])
  }

  const maybe = new Map<string, { word: string; ids: string[] }>()
  for (const [, group] of byFirst) {
    const first = words(group[0].name)[0]
    for (const m of text.matchAll(wordPattern(first))) {
      const start = m.index
      if (isCovered(start, start + m[0].length)) continue
      const initial = m[0][0]
      if (initial !== initial.toLocaleUpperCase('nb')) continue

      if (group.length === 1) {
        hits.push({ index: start, id: group[0].id })
        continue
      }
      // «Ingrid Lie … Ingrid» — én av dem er allerede nevnt med fullt navn,
      // så et senere fornavn handler om henne.
      const alreadyNamed = group.filter((p) => surelyNamed.has(p.id))
      if (alreadyNamed.length === 1) continue
      maybe.set(first.toLocaleLowerCase('nb'), { word: first, ids: group.map((p) => p.id) })
    }
  }

  const sure = [...new Map(hits.sort((a, b) => a.index - b.index).map((h) => [h.id, h.id])).keys()]
  return {
    sure,
    maybe: [...maybe.values()]
      .map((m) => ({ ...m, ids: m.ids.filter((id) => !sure.includes(id)) }))
      .filter((m) => m.ids.length > 1),
  }
}
