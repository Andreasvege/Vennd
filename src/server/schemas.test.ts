import { describe, it, expect } from 'vitest'
import { tagName, tagInput, logInput, personInput, relationshipInput, phaseInput } from './schemas'

describe('tagName', () => {
  it('trimmer og avviser tomme', () => {
    expect(tagName.parse('  Klatring ')).toBe('Klatring')
    expect(tagName.safeParse('   ').success).toBe(false)
  })
  it('avviser over 40 tegn', () => {
    expect(tagName.safeParse('x'.repeat(41)).success).toBe(false)
  })
})

describe('tagInput', () => {
  it('godtar bare farger fra paletten', () => {
    expect(tagInput.safeParse({ name: 'Jobb', color: 'teal' }).success).toBe(true)
    expect(tagInput.safeParse({ name: 'Jobb', color: '#ff0000' }).success).toBe(false)
  })
})

describe('logInput', () => {
  it('krever minst én deltaker', () => {
    expect(logInput.safeParse({ personIds: [], date: '2026-09-25' }).success).toBe(false)
  })
  it('godtar logg uten type og uten tekst', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '2026-09-25' }).success).toBe(true)
  })
  it('avviser ugyldig dato', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '25.09.2026' }).success).toBe(false)
    expect(logInput.safeParse({ personIds: ['a'], date: '2026-02-31' }).success).toBe(false)
  })
})

describe('personInput', () => {
  it('trimmer navn og tillater kadens null («aldri»)', () => {
    const p = personInput.parse({ name: ' Ingrid ', type: 'FRIEND', cadenceWeeks: null })
    expect(p.name).toBe('Ingrid')
    expect(p.cadenceWeeks).toBeNull()
  })
  it('avviser tomt navn og kadens utenfor 1–52', () => {
    expect(personInput.safeParse({ name: '  ', type: 'FRIEND' }).success).toBe(false)
    expect(personInput.safeParse({ name: 'A', type: 'FRIEND', cadenceWeeks: 0 }).success).toBe(false)
  })
})

describe('relationshipInput', () => {
  it('avviser relasjon til seg selv', () => {
    expect(relationshipInput.safeParse({ fromPersonId: 'a', toPersonId: 'a', type: 'FRIEND' }).success).toBe(false)
  })
  it('avviser slutt før start', () => {
    expect(
      relationshipInput.safeParse({
        fromPersonId: 'a', toPersonId: 'b', type: 'ROMANTIC', since: '2025-05-01', until: '2024-01-01',
      }).success,
    ).toBe(false)
  })
})

describe('phaseInput', () => {
  it('godtar kjente faser med gyldig dato', () => {
    expect(phaseInput.safeParse({ personId: 'a', phase: 'SEEING', at: '2026-09-02' }).success).toBe(true)
    expect(phaseInput.safeParse({ personId: 'a', phase: 'MARRIED', at: '2026-09-02' }).success).toBe(false)
  })
})
