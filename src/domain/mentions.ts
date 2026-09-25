// Hvem snakker teksten om? Brukes av skriv-arket til å foreslå deltakere
// mens du skriver «middag med Ingrid og Martin».
//
// Reglene er valgt for å heller foreslå for lite enn for mye:
// - Fullt navn (to ord eller flere) treffer uansett store og små bokstaver.
// - Et enkelt ord — et fornavn, eller et ettordsnavn som «Mamma» eller
//   «Mai» — treffer bare med stor forbokstav, så «tur i mai» ikke blir Mai.
// - Et navn eller fornavn flere har, blir et spørsmål (maybe), aldri et valg.

type Person = { id: string; name: string }
export type Mentions = { sure: string[]; maybe: { word: string; ids: string[] }[] }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Ordgrense som forstår æ, ø, å og andre bokstaver; genitiv er lov.
const wordPattern = (words: string) =>
  new RegExp(`(?<!\\p{L})${escape(words).replace(/\s+/g, '\\s+')}(?:s|['’]s)?(?!\\p{L})`, 'giu')

const words = (name: string) => name.trim().split(/\s+/)
const key = (s: string) => s.toLocaleLowerCase('nb')
const capitalised = (match: string) => match[0] !== match[0].toLocaleLowerCase('nb')

function group<T>(items: T[], by: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const item of items) out.set(by(item), [...(out.get(by(item)) ?? []), item])
  return out
}

export function findMentions(text: string, persons: Person[]): Mentions {
  const hits: { index: number; id: string }[] = []
  const maybe = new Map<string, { word: string; ids: string[] }>()
  const covered: [number, number][] = []
  const isCovered = (start: number, end: number) => covered.some(([s, e]) => start < e && end > s)

  // 1. Fulle navn (flere ord): sikre treff — med mindre flere heter det samme.
  const multi = persons.filter((p) => words(p.name).length > 1)
  for (const [, same] of group(multi, (p) => key(words(p.name).join(' ')))) {
    for (const m of text.matchAll(wordPattern(same[0].name))) {
      covered.push([m.index, m.index + m[0].length])
      if (same.length === 1) hits.push({ index: m.index, id: same[0].id })
      else maybe.set(key(same[0].name), { word: same[0].name, ids: same.map((p) => p.id) })
    }
  }
  const namedInFull = new Set(hits.map((h) => h.id))

  // 2. Enkeltord: ettordsnavn og fornavn, med stor forbokstav.
  const single = [
    ...persons.filter((p) => words(p.name).length === 1).map((p) => ({ word: p.name.trim(), p })),
    ...multi.map((p) => ({ word: words(p.name)[0], p })),
  ]
  for (const [, same] of group(single, (s) => key(s.word))) {
    const word = same[0].word
    const ids = [...new Set(same.map((s) => s.p.id))]
    for (const m of text.matchAll(wordPattern(word))) {
      if (isCovered(m.index, m.index + m[0].length) || !capitalised(m[0])) continue
      if (ids.length === 1) {
        hits.push({ index: m.index, id: ids[0] })
        continue
      }
      // «Ingrid Lie … Ingrid»: én av dem er alt nevnt med fullt navn, så et
      // senere fornavn handler om henne.
      if (ids.filter((id) => namedInFull.has(id)).length === 1) continue
      maybe.set(key(word), { word, ids })
    }
  }

  const sure = [...new Set(hits.sort((a, b) => a.index - b.index).map((h) => h.id))]
  return {
    sure,
    maybe: [...maybe.values()]
      .map((m) => ({ ...m, ids: m.ids.filter((id) => !sure.includes(id)) }))
      .filter((m) => m.ids.length > 1),
  }
}
