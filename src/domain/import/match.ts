import { fold } from '../search'
import { normalizeName } from '../duplicates'
import type { Contact } from './vcard'
import type { CalEvent } from './ics'

export type KnownPerson = { id: string; name: string; birthday: Date | null; emails: string[] }

export type ContactStatus = { kind: 'new' } | { kind: 'exists'; personId: string } | { kind: 'add-birthday'; personId: string }

// Samme sammenligning som duplikatsjekken: «Broby-Bergem» er «Broby Bergem».
const foldName = normalizeName

/** Finner personen kontakten matcher navnet eller e-posten til, om noen. */
function findMatch(c: Contact, persons: KnownPerson[]): KnownPerson | undefined {
  const folded = foldName(c.name)
  return persons.find((p) => foldName(p.name) === folded || (c.email && p.emails.some((e) => e.toLowerCase() === c.email?.toLowerCase())))
}

/**
 * «ny», «finnes» eller «legg til bursdag»: samme navnesammenligning som
 * søket (små bokstaver, aksenter foldet), pluss e-post som fakta.
 */
export function contactStatus(c: Contact, persons: KnownPerson[]): ContactStatus {
  const match = findMatch(c, persons)
  if (!match) return { kind: 'new' }
  if (!match.birthday && c.birthday) return { kind: 'add-birthday', personId: match.id }
  return { kind: 'exists', personId: match.id }
}

const NAME_MIN = 3

// Ord: bokstaver (Unicode-aware), inkludert æøå. Tall og skilletegn deler opp.
function titleWords(title: string): string[] {
  return title.match(/\p{L}+/gu) ?? []
}

/**
 * Personene som er med i hendelsen: e-post mot fakta, deltakernavn mot
 * fullt navn eller unikt fornavn, og ord i tittelen mot for-/etternavn
 * (hele ord, foldet). Tvetydige treff (flere personer med samme fornavn)
 * telles ikke, med mindre et senere ord i tittelen peker ut én av dem via
 * etternavnet.
 */
export function matchEvent(e: CalEvent, persons: KnownPerson[]): string[] {
  const ids: string[] = []
  const add = (id: string) => {
    if (!ids.includes(id)) ids.push(id)
  }

  const parts = persons.map((p) => ({ id: p.id, full: foldName(p.name), words: foldName(p.name).split(' ') }))
  const firstNameCounts = new Map<string, number>()
  for (const p of parts) firstNameCounts.set(p.words[0], (firstNameCounts.get(p.words[0]) ?? 0) + 1)

  // 1-2: deltakere, via e-post eller navn (fullt, eller unikt fornavn).
  for (const attendee of e.attendees) {
    if (attendee.email) {
      const byEmail = persons.find((p) => p.emails.some((em) => em.toLowerCase() === attendee.email?.toLowerCase()))
      if (byEmail) {
        add(byEmail.id)
        continue
      }
    }
    if (attendee.name) {
      const folded = foldName(attendee.name)
      const byFull = parts.find((p) => p.full === folded)
      if (byFull) {
        add(byFull.id)
        continue
      }
      if ((firstNameCounts.get(folded) ?? 0) === 1) {
        const byFirst = parts.find((p) => p.words[0] === folded)
        if (byFirst) add(byFirst.id)
      }
    }
  }

  // 3: ord i tittelen mot for-/etternavn. Et navn flere deler er tvetydig,
  // med mindre et senere ord peker ut én av dem via etternavnet.
  const words = titleWords(e.title).map(fold)
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (word.length < NAME_MIN) continue
    const matches = parts.filter((p) => p.words.includes(word))
    if (matches.length === 0) continue
    if (matches.length === 1) {
      add(matches[0].id)
      continue
    }
    // Tvetydig fornavn: se etter et senere ord som peker ut én av dem.
    const rest = words.slice(i + 1)
    const disambiguated = matches.filter((p) => p.words.some((w) => w !== word && rest.includes(w)))
    if (disambiguated.length === 1) add(disambiguated[0].id)
  }

  return ids
}

export type EventStatus = { kind: 'log' | 'plan'; duplicate: boolean }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const localISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const utcISO = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))

/**
 * Passert (før i dags lokale dato) blir en logg, kommende blir en plan.
 * Duplikat: en logg samme dag med samme personer, eller en plan med
 * samme tidspunkt og tittel (foldet).
 */
export function eventStatus(
  e: CalEvent,
  personIds: string[],
  existing: { logs: { date: Date; personIds: string[] }[]; plans: { at: Date; title: string }[] },
  now: Date,
): EventStatus {
  const eventDay = e.allDay ? utcISO(e.start) : localISO(e.start)
  const isPast = eventDay < localISO(startOfDay(now))

  if (isPast) {
    const duplicate = existing.logs.some((l) => utcISO(l.date) === eventDay && sameSet(l.personIds, personIds))
    return { kind: 'log', duplicate }
  }

  const duplicate = existing.plans.some((p) => p.at.getTime() === e.start.getTime() && foldName(p.title) === foldName(e.title))
  return { kind: 'plan', duplicate }
}
