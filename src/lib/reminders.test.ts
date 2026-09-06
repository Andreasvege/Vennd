import { describe, it, expect } from 'vitest'
import { generateAutoReminders } from './reminders'
import type { PersonWithLastContact } from '@/types'

const makeDate = (weeksAgo: number): Date => {
  const d = new Date('2026-05-06T12:00:00Z')
  d.setDate(d.getDate() - weeksAgo * 7)
  return d
}

const NOW = new Date('2026-05-06T12:00:00Z')

describe('generateAutoReminders', () => {
  it('flags a person not contacted for over the threshold', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Lars', userId: 'u1', lastContactDate: makeDate(4) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(1)
    expect(result[0].personId).toBe('p1')
  })

  it('does not flag a recently contacted person', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Jenny', userId: 'u1', lastContactDate: makeDate(1) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(0)
  })

  it('flags a person who has never been contacted', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p2', name: 'Kari', userId: 'u1', lastContactDate: null },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(1)
    expect(result[0].message).toContain('aldri')
  })

  it('includes correct message for overdue contact', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Lars', userId: 'u1', lastContactDate: makeDate(4) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result[0].message).toContain('Lars')
    expect(result[0].message).toContain('4')
  })

  it('returns empty array when all persons are up to date', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Jenny', userId: 'u1', lastContactDate: makeDate(1) },
      { id: 'p2', name: 'Lars', userId: 'u1', lastContactDate: makeDate(2) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(0)
  })
})
