import { describe, it, expect } from 'vitest'
import { computeAutoReminders } from './reminders'
import type { PersonWithCadence } from '@/types'

const NOW = new Date('2026-09-07T12:00:00Z')

const weeksAgo = (n: number): Date =>
  new Date(NOW.getTime() - n * 7 * 24 * 60 * 60 * 1000)

const person = (over: Partial<PersonWithCadence> = {}): PersonWithCadence => ({
  id: 'p1',
  name: 'Lars',
  userId: 'u1',
  cadenceWeeks: 4,
  snoozedUntil: null,
  lastContactDate: weeksAgo(10),
  ...over,
})

describe('computeAutoReminders', () => {
  it('tar med en person som har passert sin kadens', () => {
    const out = computeAutoReminders([person({ cadenceWeeks: 4, lastContactDate: weeksAgo(6) })], NOW)
    expect(out).toHaveLength(1)
    expect(out[0].personId).toBe('p1')
    expect(out[0].weeksSinceContact).toBe(6)
  })

  it('hopper over en person som er innenfor sin kadens', () => {
    const out = computeAutoReminders([person({ cadenceWeeks: 4, lastContactDate: weeksAgo(2) })], NOW)
    expect(out).toEqual([])
  })

  it('tar med en person som er akkurat på grensen', () => {
    const out = computeAutoReminders([person({ cadenceWeeks: 4, lastContactDate: weeksAgo(4) })], NOW)
    expect(out).toHaveLength(1)
  })

  it('hopper over personer med cadenceWeeks null uansett hvor lenge det er siden', () => {
    const out = computeAutoReminders([person({ cadenceWeeks: null, lastContactDate: weeksAgo(300) })], NOW)
    expect(out).toEqual([])
  })

  it('hopper over personer som er utsatt til en dato i fremtiden', () => {
    const out = computeAutoReminders(
      [person({ lastContactDate: weeksAgo(10), snoozedUntil: new Date('2026-09-20T12:00:00Z') })],
      NOW
    )
    expect(out).toEqual([])
  })

  it('tar med personer der utsettelsen har gått ut', () => {
    const out = computeAutoReminders(
      [person({ lastContactDate: weeksAgo(10), snoozedUntil: new Date('2026-09-01T12:00:00Z') })],
      NOW
    )
    expect(out).toHaveLength(1)
  })

  it('tar med personer uten en eneste loggført kontakt', () => {
    const out = computeAutoReminders([person({ lastContactDate: null })], NOW)
    expect(out).toHaveLength(1)
    expect(out[0].weeksSinceContact).toBeNull()
    expect(out[0].message).toContain('aldri')
  })

  it('respekterer ulik kadens per person', () => {
    const out = computeAutoReminders(
      [
        person({ id: 'partner', name: 'Kari', cadenceWeeks: 1, lastContactDate: weeksAgo(2) }),
        person({ id: 'bekjent', name: 'Ola', cadenceWeeks: 26, lastContactDate: weeksAgo(2) }),
      ],
      NOW
    )
    expect(out.map((r) => r.personId)).toEqual(['partner'])
  })

  it('gir en syntetisk id som ikke kolliderer med databaserader', () => {
    const out = computeAutoReminders([person({ lastContactDate: weeksAgo(10) })], NOW)
    expect(out[0].id).toBe('auto:p1')
  })

  it('navngir personen i meldingen', () => {
    const out = computeAutoReminders([person({ name: 'Jenny', lastContactDate: weeksAgo(9) })], NOW)
    expect(out[0].message).toContain('Jenny')
    expect(out[0].personName).toBe('Jenny')
  })

  it('sorterer mest forfalte først, og aldri-kontaktede øverst', () => {
    const out = computeAutoReminders(
      [
        person({ id: 'a', cadenceWeeks: 4, lastContactDate: weeksAgo(5) }),
        person({ id: 'b', cadenceWeeks: 4, lastContactDate: weeksAgo(20) }),
        person({ id: 'c', cadenceWeeks: 4, lastContactDate: null }),
      ],
      NOW
    )
    expect(out.map((r) => r.personId)).toEqual(['c', 'b', 'a'])
  })

  it('returnerer tom liste for tom inndata', () => {
    expect(computeAutoReminders([], NOW)).toEqual([])
  })
})
