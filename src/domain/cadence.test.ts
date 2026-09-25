import { describe, it, expect } from 'vitest'
import { DEFAULT_CADENCE_WEEKS, defaultCadenceFor, lastContactByPerson } from './cadence'
import type { RelationshipType } from '@/types'

describe('kadens-standardverdier', () => {
  it('følger «Tett»-profilen', () => {
    expect(DEFAULT_CADENCE_WEEKS.ROMANTIC).toBe(1)
    expect(DEFAULT_CADENCE_WEEKS.FAMILY).toBe(3)
    expect(DEFAULT_CADENCE_WEEKS.FRIEND).toBe(4)
    expect(DEFAULT_CADENCE_WEEKS.COLLEAGUE).toBe(8)
    expect(DEFAULT_CADENCE_WEEKS.ACQUAINTANCE).toBe(26)
    expect(DEFAULT_CADENCE_WEEKS.OTHER).toBe(12)
  })

  it('dekker alle seks relasjonstyper', () => {
    expect(Object.keys(DEFAULT_CADENCE_WEEKS)).toHaveLength(6)
  })

  it('gir tettere kadens til nærere relasjoner enn til fjernere', () => {
    expect(DEFAULT_CADENCE_WEEKS.ROMANTIC).toBeLessThan(DEFAULT_CADENCE_WEEKS.FRIEND)
    expect(DEFAULT_CADENCE_WEEKS.FRIEND).toBeLessThan(DEFAULT_CADENCE_WEEKS.ACQUAINTANCE)
  })

  it('defaultCadenceFor slår opp riktig verdi', () => {
    const cases: [RelationshipType, number][] = [
      ['ROMANTIC', 1],
      ['FAMILY', 3],
      ['ACQUAINTANCE', 26],
    ]
    for (const [type, weeks] of cases) {
      expect(defaultCadenceFor(type)).toBe(weeks)
    }
  })
})

describe('lastContactByPerson', () => {
  it('gir hver deltaker loggens dato, og beholder den nyeste', () => {
    const m = lastContactByPerson([
      { date: new Date('2026-09-01'), personIds: ['a', 'b'] },
      { date: new Date('2026-09-20'), personIds: ['a'] },
    ])
    expect(m.get('a')).toEqual(new Date('2026-09-20'))
    expect(m.get('b')).toEqual(new Date('2026-09-01'))
  })

  it('er uavhengig av rekkefølgen loggene kommer i', () => {
    const m = lastContactByPerson([
      { date: new Date('2026-09-20'), personIds: ['a'] },
      { date: new Date('2026-09-01'), personIds: ['a'] },
    ])
    expect(m.get('a')).toEqual(new Date('2026-09-20'))
  })

  it('gir tomt kart for ingen logger', () => {
    expect(lastContactByPerson([]).size).toBe(0)
  })
})
