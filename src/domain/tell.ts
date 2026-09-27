// «Fortell om Ingrid»: du skriver fritt, Claude foreslår hva det betyr for
// kartet, og du velger hva som skal inn. Her er det rene: fra Claudes svar
// til forslag som gir mening mot det du allerede har.
import { clean, lookup, same } from './suggestions'
import { dueFrom } from './plans'
import { fold } from './search'

export const TELL_TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const
export type TellType = (typeof TELL_TYPES)[number]

export type TellContext = {
  subject: {
    id: string
    name: string
    relationLabel: string | null
    hasBirthday: boolean
    tagIds: string[]
    facts: { label: string; value: string }[]
    /** Åpne tråder med henne, så de ikke foreslås på nytt. */
    openThreads?: string[]
  }
  persons: { id: string; name: string }[]
  tags: { id: string; name: string }[]
  /** Forbindelsene som finnes, så de ikke foreslås igjen. */
  pairs: [string, string][]
}

/** Det Claude svarer, etter skjemaet i `src/server/claude/tell.ts`. */
export type ClaudeTell = {
  relationLabel: string | null
  birthday: { day: number; month: number; year: number | null } | null
  groups: string[]
  facts: { person: string; label: string; value: string }[]
  relations: { a: string; b: string; type: TellType; label: string | null }[]
  threads: { people: string[]; title: string; due: 'none' | 'week' | 'month' }[]
}

/** En person i et forslag: en du har, eller et nytt navn. */
export type TellRef = { id: string; name: string } | { id: null; name: string }

export type TellProposal =
  | { kind: 'LABEL'; personId: string; label: string }
  | { kind: 'BIRTHDAY'; personId: string; date: string }
  | { kind: 'GROUP'; personId: string; tagId: string | null; name: string }
  | { kind: 'FACT'; personId: string; name: string; label: string; value: string }
  | { kind: 'RELATION'; a: TellRef; b: TellRef; type: TellType; label: string | null }
  | { kind: 'THREAD'; title: string; personIds: string[]; dueDate: string | null }

const MAX = { facts: 8, relations: 8, threads: 3, groups: 2 }

const pad = (n: number) => String(n).padStart(2, '0')

/** En gyldig dato, eller null. Uten år lagres bursdagen som år 1900. */
function birthdayISO(b: NonNullable<ClaudeTell['birthday']>): string | null {
  const year = b.year && b.year > 1900 && b.year <= new Date().getFullYear() ? b.year : 1900
  const d = new Date(Date.UTC(year, b.month - 1, b.day))
  if (d.getUTCMonth() !== b.month - 1 || d.getUTCDate() !== b.day) return null
  return `${year}-${pad(b.month)}-${pad(b.day)}`
}

/**
 * Fra Claudes svar til forslag: navn slås opp blant dine personer (fullt
 * navn, eller et fornavn bare én har), det som finnes fra før forkastes,
 * og hver type har et tak. Et navn som ikke finnes, blir en ny person, men
 * bare i en forbindelse: en ny person uten kobling hører hjemme i Venter.
 */
export function resolveTell(ctx: TellContext, out: ClaudeTell, now: Date = new Date()): TellProposal[] {
  const { subject } = ctx
  const rows: TellProposal[] = []
  const nameOf = new Map(ctx.persons.map((p) => [p.id, p.name]))
  // Subjektet heter ofte bare «hun» eller fornavnet; det går alltid til henne.
  const find = (name: string): string | null => {
    const n = fold(clean(name, 120))
    if (!n) return null
    if (n === fold(subject.name) || n === fold(subject.name).split(' ')[0]) return subject.id
    return lookup(name, ctx.persons)
  }

  const label = out.relationLabel ? clean(out.relationLabel, 60) : ''
  if (label && !(subject.relationLabel && same(subject.relationLabel, label))) {
    rows.push({ kind: 'LABEL', personId: subject.id, label })
  }

  if (out.birthday && !subject.hasBirthday) {
    const date = birthdayISO(out.birthday)
    if (date) rows.push({ kind: 'BIRTHDAY', personId: subject.id, date })
  }

  const groups: TellProposal[] = []
  for (const g of out.groups) {
    const name = clean(g, 40)
    if (!name) continue
    const tag = ctx.tags.find((t) => same(t.name, name))
    if (tag && subject.tagIds.includes(tag.id)) continue
    if (groups.some((x) => x.kind === 'GROUP' && same(x.name, name))) continue
    groups.push({ kind: 'GROUP', personId: subject.id, tagId: tag?.id ?? null, name: tag?.name ?? name })
  }
  rows.push(...groups.slice(0, MAX.groups))

  const facts: TellProposal[] = []
  for (const f of out.facts) {
    const personId = find(f.person)
    const factLabel = clean(f.label, 40)
    const value = clean(f.value, 200)
    if (!personId || !factLabel || !value) continue
    if (personId === subject.id && subject.facts.some((k) => same(k.label, factLabel) && same(k.value, value))) continue
    if (facts.some((x) => x.kind === 'FACT' && x.personId === personId && same(x.label, factLabel))) continue
    facts.push({ kind: 'FACT', personId, name: nameOf.get(personId) ?? subject.name, label: factLabel, value })
  }
  rows.push(...facts.slice(0, MAX.facts))

  const known = new Set(ctx.pairs.map(([a, b]) => [a, b].sort().join('|')))
  const relations: TellProposal[] = []
  const ref = (name: string): TellRef | null => {
    const id = find(name)
    if (id) return { id, name: id === subject.id ? subject.name : nameOf.get(id)! }
    const cleaned = clean(name, 120)
    // Et fornavn flere av dine deler, er tvetydig, ikke nytt.
    if (!cleaned || ctx.persons.some((p) => fold(p.name).split(' ')[0] === fold(cleaned))) return null
    return { id: null, name: cleaned }
  }
  for (const r of out.relations) {
    const a = ref(r.a)
    const b = ref(r.b)
    if (!a || !b) continue
    if (a.id !== null && a.id === b.id) continue
    if (fold(a.name) === fold(b.name)) continue
    // Minst én av dem må være en du har; to ukjente er ikke noe å feste.
    if (a.id === null && b.id === null) continue
    if (a.id && b.id && known.has([a.id, b.id].sort().join('|'))) continue
    const key = [fold(a.name), fold(b.name)].sort().join('|')
    if (relations.some((x) => x.kind === 'RELATION' && [fold(x.a.name), fold(x.b.name)].sort().join('|') === key)) continue
    relations.push({ kind: 'RELATION', a, b, type: r.type, label: r.label ? clean(r.label, 60) || null : null })
  }
  rows.push(...relations.slice(0, MAX.relations))

  const threads: TellProposal[] = []
  for (const th of out.threads) {
    const title = clean(th.title, 120)
    if (!title || threads.some((x) => x.kind === 'THREAD' && same(x.title, title))) continue
    if ((subject.openThreads ?? []).some((o) => same(o, title))) continue
    const ids = [...new Set(th.people.map(find).filter((id): id is string => id !== null))]
    threads.push({ kind: 'THREAD', title, personIds: ids.length ? ids : [subject.id], dueDate: dueFrom(th.due, now) })
  }
  rows.push(...threads.slice(0, MAX.threads))

  return rows
}
