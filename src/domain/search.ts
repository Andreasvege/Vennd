/** Minste lengde for at et ord kan tolkes som (starten på) et navn. */
const NAME_MIN = 3

// Kombinerende tegn som skal bort, unntatt ringen over å (U+030A), som
// hører til bokstaven på norsk. æ og ø brytes ikke ned av NFD i det hele tatt.
const COMBINING_EXCEPT_RING = /[̀-̉̋-ͯ]/g

/** Små bokstaver, uten aksenter (é → e), men med æ, ø og å i behold. */
export function fold(s: string): string {
  return s.normalize('NFD').replace(COMBINING_EXCEPT_RING, '').normalize('NFC').toLowerCase()
}

export type Interpretation = {
  /** Én gruppe per ord som var et navn: ELLER innenfor, OG mellom gruppene. */
  people: string[][]
  /** Ordene som skal finnes i teksten. */
  terms: string[]
}

/**
 * Tolker et søk: ord som er starten på noens for- eller etternavn blir et
 * personfilter, resten er fritekst. «ingrid intervju» betyr da det Ingrid
 * sa om intervjuet, ikke alle logger med ordet.
 */
export function interpretQuery(q: string, persons: { id: string; name: string }[]): Interpretation {
  const words = fold(q).split(/\s+/).filter(Boolean)
  const kept = words.length === 1 ? words : words.filter((w) => w.length >= 2)
  const names = persons.map((p) => ({ id: p.id, parts: fold(p.name).split(/\s+/) }))

  const people: string[][] = []
  const terms: string[] = []
  for (const word of kept) {
    const ids = word.length >= NAME_MIN ? names.filter((n) => n.parts.some((part) => part.startsWith(word))).map((n) => n.id) : []
    if (ids.length) people.push(ids)
    else terms.push(word)
  }
  return { people, terms }
}

export type Segment = { text: string; match: boolean }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Et utdrag av teksten rundt første treff, delt i biter så treffene kan
 * utheves. Sammenligningen er uten store bokstaver; aksenter må stemme.
 */
export function snippet(text: string, terms: string[], radius = 60): Segment[] {
  const words = terms.filter(Boolean)
  const pattern = words.length ? new RegExp(`(${words.map(escape).join('|')})`, 'gi') : null
  const first = pattern ? text.search(pattern) : -1

  let start = 0
  let end = Math.min(text.length, radius * 2)
  if (first > radius) {
    // Start ved et ordskille før treffet, så utdraget ikke begynner midt i et ord.
    const cut = text.lastIndexOf(' ', first - radius)
    start = cut >= 0 ? cut + 1 : first - radius
    end = Math.min(text.length, first + radius)
  } else if (first >= 0) {
    end = Math.min(text.length, first + radius)
  }
  if (end < text.length) {
    const cut = text.indexOf(' ', end)
    end = cut >= 0 ? cut : text.length
  }

  const body = text.slice(start, end)
  const parts: Segment[] = pattern
    ? body
        .split(pattern)
        .filter(Boolean)
        .map((s) => ({ text: s, match: words.some((w) => s.toLowerCase() === w.toLowerCase()) }))
    : [{ text: body, match: false }]

  if (start > 0) parts[0] = { ...parts[0], text: `…${parts[0].text}` }
  if (end < text.length) {
    const last = parts.length - 1
    parts[last] = { ...parts[last], text: `${parts[last].text}…` }
  }
  return parts
}
