import { describe, expect, it } from 'vitest'
import { enrichOrder, gapsOf, seenDate, type EnrichPerson } from './enrich'

const base: EnrichPerson = {
  id: 'a',
  name: 'Ingrid',
  relationLabel: 'studievenn',
  cadenceWeeks: 4,
  tagIds: ['radio'],
  birthday: '1995-03-01',
  factCount: 2,
  relationshipCount: 3,
  lastContact: '2026-09-01',
}

describe('gapsOf', () => {
  it('finner ingenting når alt er fylt ut', () => {
    expect(gapsOf(base)).toEqual([])
  })
  it('lister det som mangler, i kortets rekkefølge', () => {
    expect(gapsOf({ ...base, birthday: null, lastContact: null, tagIds: [] })).toEqual(['seen', 'group', 'birthday'])
  })
  it('regner en tom etikett som manglende', () => {
    expect(gapsOf({ ...base, relationLabel: '' })).toEqual(['who'])
  })
})

describe('enrichOrder', () => {
  it('hopper over dem det ikke mangler noe om', () => {
    expect(enrichOrder([base, { ...base, id: 'b', birthday: null }])).toEqual(['b'])
  })
  it('tar de nærmeste først, så dem det mangler mest om, så navn', () => {
    const people = [
      { ...base, id: 'sjelden', name: 'A', cadenceWeeks: 26, birthday: null },
      { ...base, id: 'aldri', name: 'B', cadenceWeeks: null, birthday: null },
      { ...base, id: 'nær-lite', name: 'C', cadenceWeeks: 2, birthday: null },
      { ...base, id: 'nær-mye', name: 'D', cadenceWeeks: 2, birthday: null, tagIds: [] },
    ]
    expect(enrichOrder(people)).toEqual(['nær-mye', 'nær-lite', 'sjelden', 'aldri'])
  })
})

describe('seenDate', () => {
  it('regner dagene tilbake fra i dag, i UTC', () => {
    const today = new Date('2026-09-27T22:30:00Z')
    expect(seenDate('week', today)).toBe('2026-09-24')
    expect(seenDate('month', today)).toBe('2026-09-12')
  })
})
