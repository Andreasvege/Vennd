import { describe, it, expect } from 'vitest'
import { contactStatus, matchEvent, eventStatus, type KnownPerson } from './match'
import type { Contact } from './vcard'
import type { CalEvent } from './ics'

const person = (over: Partial<KnownPerson> & { id: string; name: string }): KnownPerson => ({
  birthday: null,
  emails: [],
  ...over,
})

const contact = (over: Partial<Contact> & { name: string }): Contact => ({
  key: 'c0',
  birthday: null,
  phone: null,
  email: null,
  note: null,
  ...over,
})

const event = (over: Partial<CalEvent> & { title: string; start: Date }): CalEvent => ({
  key: 'e0',
  uid: null,
  description: null,
  allDay: false,
  attendees: [],
  recurring: false,
  ...over,
})

describe('contactStatus', () => {
  const persons = [
    person({ id: 'p1', name: 'Ingrid Aas', birthday: null, emails: ['ingrid@example.com'] }),
    person({ id: 'p2', name: 'Martin Nilsen', birthday: new Date(Date.UTC(1990, 0, 1, 12)) }),
  ]

  it('ny person når navnet ikke finnes', () => {
    expect(contactStatus(contact({ name: 'Sofie Berg' }), persons)).toEqual({ kind: 'new' })
  })

  it('finnes når navnet matcher, uansett store bokstaver og aksenter', () => {
    expect(contactStatus(contact({ name: 'INGRID ÅÅS'.replace('ÅÅS', 'Aas') }), persons)).toEqual({ kind: 'exists', personId: 'p1' })
  })

  it('finnes når e-posten matcher, selv om navnet er skrevet annerledes', () => {
    expect(contactStatus(contact({ name: 'I. Aas', email: 'ingrid@example.com' }), persons)).toEqual({ kind: 'exists', personId: 'p1' })
  })

  it('legg til bursdag når personen finnes uten bursdag, og kontakten har en', () => {
    expect(contactStatus(contact({ name: 'Ingrid Aas', birthday: '1990-05-01' }), persons)).toEqual({ kind: 'add-birthday', personId: 'p1' })
  })

  it('finnes (ikke legg-til-bursdag) når personen alt har bursdag', () => {
    expect(contactStatus(contact({ name: 'Martin Nilsen', birthday: '1990-01-01' }), persons)).toEqual({ kind: 'exists', personId: 'p2' })
  })

  it('finnes uten legg-til-bursdag når kontakten selv mangler bursdag', () => {
    expect(contactStatus(contact({ name: 'Ingrid Aas' }), persons)).toEqual({ kind: 'exists', personId: 'p1' })
  })
})

describe('matchEvent', () => {
  const persons = [
    person({ id: 'ingrid-aas', name: 'Ingrid Aas', emails: ['ingrid@example.com'] }),
    person({ id: 'ingrid-berg', name: 'Ingrid Berg', emails: ['iberg@example.com'] }),
    person({ id: 'martin', name: 'Martin Nilsen', emails: ['martin@example.com'] }),
    person({ id: 'soren', name: 'Søren Ødegård' }),
  ]

  it('matcher deltaker på e-post', () => {
    const e = event({ title: 'Møte', start: new Date(), attendees: [{ name: null, email: 'martin@example.com' }] })
    expect(matchEvent(e, persons)).toEqual(['martin'])
  })

  it('matcher deltaker på fullt navn', () => {
    const e = event({ title: 'Møte', start: new Date(), attendees: [{ name: 'Ingrid Aas', email: null }] })
    expect(matchEvent(e, persons)).toEqual(['ingrid-aas'])
  })

  it('matcher deltaker på unikt fornavn', () => {
    const e = event({ title: 'Møte', start: new Date(), attendees: [{ name: 'Martin', email: null }] })
    expect(matchEvent(e, persons)).toEqual(['martin'])
  })

  it('matcher IKKE deltaker på tvetydig fornavn ("Ingrid" finnes to ganger)', () => {
    const e = event({ title: 'Møte', start: new Date(), attendees: [{ name: 'Ingrid', email: null }] })
    expect(matchEvent(e, persons)).toEqual([])
  })

  it('matcher ord i tittelen mot fornavn: «Kaffe med Ingrid» er tvetydig og gir ingen', () => {
    const e = event({ title: 'Kaffe med Ingrid', start: new Date() })
    expect(matchEvent(e, persons)).toEqual([])
  })

  it('et etternavn senere i tittelen løser opp tvetydigheten: «Middag med Ingrid Aas»', () => {
    const e = event({ title: 'Middag med Ingrid Aas', start: new Date() })
    expect(matchEvent(e, persons)).toEqual(['ingrid-aas'])
  })

  it('matcher unikt fornavn i tittelen', () => {
    const e = event({ title: 'Løpetur med Martin', start: new Date() })
    expect(matchEvent(e, persons)).toEqual(['martin'])
  })

  it('matcher etternavn alene i tittelen', () => {
    const e = event({ title: 'Prosjektmøte Nilsen', start: new Date() })
    expect(matchEvent(e, persons)).toEqual(['martin'])
  })

  it('ord under 3 tegn teller ikke som navn', () => {
    const e = event({ title: 'Ida og Bo', start: new Date() })
    expect(matchEvent(e, persons)).toEqual([])
  })

  it('bevarer æøå i ordsplitting', () => {
    const e = event({ title: 'Tur med Søren', start: new Date() })
    expect(matchEvent(e, persons)).toEqual(['soren'])
  })

  it('deduplikerer og gir stabil rekkefølge når samme person matcher flere ganger', () => {
    const e = event({
      title: 'Kaffe med Martin',
      start: new Date(),
      attendees: [{ name: 'Martin Nilsen', email: 'martin@example.com' }],
    })
    expect(matchEvent(e, persons)).toEqual(['martin'])
  })

  it('ingen kjente personer gir tom liste', () => {
    const e = event({ title: 'Tannlegetime', start: new Date(), attendees: [{ name: null, email: 'dentist@example.com' }] })
    expect(matchEvent(e, persons)).toEqual([])
  })
})

describe('eventStatus', () => {
  const now = new Date(2026, 8, 26, 12) // 26. sept 2026, lokal tid

  it('en hendelse i går blir en logg', () => {
    const e = event({ title: 'Frokost', start: new Date(2026, 8, 25, 8) })
    const status = eventStatus(e, ['p1'], { logs: [], plans: [] }, now)
    expect(status).toEqual({ kind: 'log', duplicate: false })
  })

  it('en hendelse tidligere i dag er fortsatt i dag, og blir en plan (ikke en logg før dagen er omme)', () => {
    const e = event({ title: 'Frokost', start: new Date(2026, 8, 26, 8) })
    const status = eventStatus(e, ['p1'], { logs: [], plans: [] }, now)
    expect(status.kind).toBe('plan')
  })

  it('en hendelse senere i dag blir en plan', () => {
    const e = event({ title: 'Middag', start: new Date(2026, 8, 26, 19) })
    const status = eventStatus(e, ['p1'], { logs: [], plans: [] }, now)
    expect(status.kind).toBe('plan')
  })

  it('gir duplikat=true for en logg samme dag med samme personer', () => {
    const e = event({ title: 'Frokost', start: new Date(2026, 8, 20, 8) })
    const existing = { logs: [{ date: new Date(Date.UTC(2026, 8, 20, 12)), personIds: ['p1', 'p2'] }], plans: [] }
    const status = eventStatus(e, ['p2', 'p1'], existing, now)
    expect(status).toEqual({ kind: 'log', duplicate: true })
  })

  it('ikke duplikat når personene er forskjellige', () => {
    const e = event({ title: 'Frokost', start: new Date(2026, 8, 20, 8) })
    const existing = { logs: [{ date: new Date(Date.UTC(2026, 8, 20, 12)), personIds: ['p1'] }], plans: [] }
    const status = eventStatus(e, ['p2'], existing, now)
    expect(status.duplicate).toBe(false)
  })

  it('heldagshendelse i fortiden sammenlignes på UTC-dato', () => {
    const e = event({ title: 'Bursdag', start: new Date(Date.UTC(2026, 8, 20, 12)), allDay: true })
    const existing = { logs: [{ date: new Date(Date.UTC(2026, 8, 20, 12)), personIds: ['p1'] }], plans: [] }
    const status = eventStatus(e, ['p1'], existing, now)
    expect(status).toEqual({ kind: 'log', duplicate: true })
  })

  it('gir duplikat=true for en plan med samme tidspunkt og tittel (foldet)', () => {
    const at = new Date(2026, 9, 5, 18, 0)
    const e = event({ title: 'MIDDAG MED FAMILIEN', start: at })
    const existing = { logs: [], plans: [{ at, title: 'Middag med familien' }] }
    const status = eventStatus(e, ['p1'], existing, now)
    expect(status).toEqual({ kind: 'plan', duplicate: true })
  })

  it('plan med samme tittel men annet tidspunkt er ikke duplikat', () => {
    const e = event({ title: 'Middag med familien', start: new Date(2026, 9, 5, 19, 0) })
    const existing = { logs: [], plans: [{ at: new Date(2026, 9, 5, 18, 0), title: 'Middag med familien' }] }
    const status = eventStatus(e, ['p1'], existing, now)
    expect(status.duplicate).toBe(false)
  })
})
