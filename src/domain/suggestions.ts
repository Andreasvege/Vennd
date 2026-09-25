import { fold } from './search'
import { dueFrom } from './plans'

export type SuggestContext = {
  participants: { id: string; name: string; facts: { label: string; value: string }[]; openThreads: string[] }[]
  persons: { id: string; name: string }[]
}

/** Det Claude svarer, etter skjemaet i `src/server/claude/suggest.ts`. */
export type ClaudeOutput = {
  threads: { people: string[]; title: string; due: 'none' | 'week' | 'month' }[]
  facts: { person: string; label: string; value: string }[]
  people: { name: string }[]
}

export type SuggestionRow =
  | { kind: 'THREAD'; payload: { title: string; personIds: string[]; dueDate: string | null } }
  | { kind: 'FACT'; payload: { personId: string; label: string; value: string } }
  | { kind: 'PARTICIPANT'; payload: { personId: string } }
  | { kind: 'PERSON'; payload: { name: string } }

const MAX = { threads: 3, facts: 5, people: 3 }
const clean = (s: string, max: number) => s.trim().replace(/\s+/g, ' ').slice(0, max)
const same = (a: string, b: string) => fold(clean(a, 500)) === fold(clean(b, 500))

/**
 * Et navn fra Claude til én person: fullt navn, ellers et fornavn som bare
 * én har. Tvetydig eller ukjent gir null: da er det bedre å la være.
 */
function lookup(name: string, among: { id: string; name: string }[]): string | null {
  const wanted = fold(clean(name, 120))
  const full = among.filter((p) => fold(p.name) === wanted)
  if (full.length === 1) return full[0].id
  const first = among.filter((p) => fold(p.name).split(' ')[0] === wanted)
  return first.length === 1 ? first[0].id : null
}

/**
 * Fra Claudes svar til forslag som faktisk gir mening: navn slås opp blant
 * brukerens egne personer, det som finnes fra før forkastes, og hver type
 * har et tak, så en ordrik logg ikke gir en vegg av forslag.
 */
export function resolveSuggestions(ctx: SuggestContext, out: ClaudeOutput, now: Date = new Date()): SuggestionRow[] {
  const rows: SuggestionRow[] = []
  const participantIds = ctx.participants.map((p) => p.id)

  const openTitles = ctx.participants.flatMap((p) => p.openThreads)
  const threads: SuggestionRow[] = []
  for (const th of out.threads) {
    const title = clean(th.title, 120)
    if (!title || openTitles.some((o) => same(o, title))) continue
    if (threads.some((r) => r.kind === 'THREAD' && same(r.payload.title, title))) continue
    const ids = [...new Set(th.people.map((n) => lookup(n, ctx.participants)).filter((id): id is string => id !== null))]
    threads.push({ kind: 'THREAD', payload: { title, personIds: ids.length ? ids : participantIds, dueDate: dueFrom(th.due, now) } })
  }
  rows.push(...threads.slice(0, MAX.threads))

  const facts: SuggestionRow[] = []
  for (const f of out.facts) {
    const personId = lookup(f.person, ctx.persons)
    const label = clean(f.label, 40)
    const value = clean(f.value, 200)
    if (!personId || !label || !value) continue
    const known = ctx.participants.find((p) => p.id === personId)?.facts ?? []
    if (known.some((k) => same(k.label, label) && same(k.value, value))) continue
    facts.push({ kind: 'FACT', payload: { personId, label, value } })
  }
  rows.push(...facts.slice(0, MAX.facts))

  const people: SuggestionRow[] = []
  for (const { name } of out.people) {
    const cleaned = clean(name, 120)
    if (!cleaned) continue
    const personId = lookup(cleaned, ctx.persons)
    if (personId) {
      if (!participantIds.includes(personId)) people.push({ kind: 'PARTICIPANT', payload: { personId } })
      continue
    }
    // Ukjent, men ikke bare et fornavn som flere kjente deler (det er tvetydig, ikke nytt).
    const sharesFirstName = ctx.persons.some((p) => fold(p.name).split(' ')[0] === fold(cleaned))
    if (!sharesFirstName) people.push({ kind: 'PERSON', payload: { name: cleaned } })
  }
  rows.push(...people.slice(0, MAX.people))

  return rows
}
