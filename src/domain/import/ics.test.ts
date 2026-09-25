import { describe, it, expect } from 'vitest'
import { parseEvents } from './ics'

// Outlook/Google-stil: VTIMEZONE-blokk, TZID på DTSTART, VALARM nøstet i VEVENT.
const WITH_TIMEZONE_AND_ALARM = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Oslo',
  'TZOFFSETFROM:+0100',
  'BEGIN:DAYLIGHT',
  'DTSTART:19810329T020000',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
  'BEGIN:VEVENT',
  'UID:tz-event@example.com',
  'DTSTART;TZID=Europe/Oslo:20260410T140000',
  'SUMMARY:Kaffe med Ingrid',
  'BEGIN:VALARM',
  'TRIGGER:-PT15M',
  'DESCRIPTION:Husk kaffe',
  'ACTION:DISPLAY',
  'END:VALARM',
  'ATTENDEE;CN=Ingrid Aas:mailto:ingrid@example.com',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n')

const UTC_EVENT = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'UID:utc@example.com',
  'DTSTART:20260101T090000Z',
  'SUMMARY:Nyttårsmøte',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\n')

const ALL_DAY_EVENT = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'UID:allday@example.com',
  'DTSTART;VALUE=DATE:20260615',
  'SUMMARY:Bursdag',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\n')

const RECURRING_EVENT = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'UID:weekly@example.com',
  'DTSTART:20260105T180000Z',
  'SUMMARY:Ukentlig trening',
  'RRULE:FREQ=WEEKLY;COUNT=52',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\n')

const ESCAPED_AND_FOLDED = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'UID:esc@example.com',
  'DTSTART:20260320T120000Z',
  'SUMMARY:Middag\\, kaffe og prat',
  'DESCRIPTION:Lang beskrivelse som ',
  ' fortsetter på neste linje.',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n')

const NO_DTSTART = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:nodtstart@example.com', 'SUMMARY:Uten start', 'END:VEVENT', 'END:VCALENDAR'].join('\n')

describe('parseEvents', () => {
  it('tolker TZID-tid som lokal tid, og lar ikke VTIMEZONE/VALARM-felt lekke inn', () => {
    const [e] = parseEvents(WITH_TIMEZONE_AND_ALARM)
    expect(e.start).toEqual(new Date(2026, 3, 10, 14, 0, 0))
    expect(e.allDay).toBe(false)
    expect(e.title).toBe('Kaffe med Ingrid')
    // DESCRIPTION lå i VALARM, ikke direkte i VEVENT.
    expect(e.description).toBeNull()
    expect(e.attendees).toEqual([{ name: 'Ingrid Aas', email: 'ingrid@example.com' }])
    expect(e.recurring).toBe(false)
    expect(e.uid).toBe('tz-event@example.com')
  })

  it('Z-tid tolkes som UTC', () => {
    const [e] = parseEvents(UTC_EVENT)
    expect(e.start).toEqual(new Date(Date.UTC(2026, 0, 1, 9, 0, 0)))
    expect(e.allDay).toBe(false)
  })

  it('VALUE=DATE gir heldagshendelse lagret kl. 12:00 UTC', () => {
    const [e] = parseEvents(ALL_DAY_EVENT)
    expect(e.allDay).toBe(true)
    expect(e.start).toEqual(new Date(Date.UTC(2026, 5, 15, 12)))
  })

  it('markerer RRULE som gjentakende', () => {
    const [e] = parseEvents(RECURRING_EVENT)
    expect(e.recurring).toBe(true)
  })

  it('unescaper komma i SUMMARY og folder DESCRIPTION over flere linjer', () => {
    const [e] = parseEvents(ESCAPED_AND_FOLDED)
    expect(e.title).toBe('Middag, kaffe og prat')
    expect(e.description).toBe('Lang beskrivelse som fortsetter på neste linje.')
  })

  it('hopper over hendelser uten DTSTART', () => {
    expect(parseEvents(NO_DTSTART)).toEqual([])
  })

  it('gir tom liste for tom fil', () => {
    expect(parseEvents('')).toEqual([])
  })

  it('gir stabile index-baserte nøkler på tvers av flere hendelser', () => {
    const text = [UTC_EVENT, ALL_DAY_EVENT].join('\n')
    const events = parseEvents(text)
    expect(events.map((e) => e.key)).toEqual(['e0', 'e1'])
  })

  it('SUMMARY mangler gir tom tittel, ikke feil', () => {
    const text = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:x@example.com', 'DTSTART:20260101T090000Z', 'END:VEVENT', 'END:VCALENDAR'].join('\n')
    expect(parseEvents(text)[0].title).toBe('')
  })

  it('flere ATTENDEE og e-post uten CN', () => {
    const text = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:multi@example.com',
      'DTSTART:20260101T090000Z',
      'SUMMARY:Møte',
      'ATTENDEE;CN=Martin Nilsen:mailto:Martin@Example.com',
      'ATTENDEE:mailto:uten.navn@example.com',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n')
    const [e] = parseEvents(text)
    expect(e.attendees).toEqual([
      { name: 'Martin Nilsen', email: 'martin@example.com' },
      { name: null, email: 'uten.navn@example.com' },
    ])
  })

  it('floating tid (uten sone) tolkes som lokal tid', () => {
    const text = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:float@example.com', 'DTSTART:20260710T083000', 'SUMMARY:Frokost', 'END:VEVENT', 'END:VCALENDAR'].join('\n')
    const [e] = parseEvents(text)
    expect(e.start).toEqual(new Date(2026, 6, 10, 8, 30, 0))
    expect(e.allDay).toBe(false)
  })
})
