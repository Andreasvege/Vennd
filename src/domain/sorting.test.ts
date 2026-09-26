import { describe, it, expect } from 'vitest'
import { closenessPreset, deckOrder, defaultCadence, missingPairs, networkHints, newPairs, pullRelated, rankKnows } from './sorting'

const p = (id: string, name: string, extra: Partial<{ logCount: number; birthday: boolean; email: string | null }> = {}) => ({
  id,
  name,
  logCount: extra.logCount ?? 0,
  hasBirthday: extra.birthday ?? false,
  email: extra.email ?? null,
})

describe('deckOrder', () => {
  it('tar de med logger først, så de med bursdag, så resten alfabetisk', () => {
    const deck = deckOrder([p('c', 'Cecilie'), p('a', 'Anders', { birthday: true }), p('b', 'Bjørn', { logCount: 2 }), p('d', 'Dina')])
    expect(deck).toEqual(['b', 'a', 'c', 'd'])
  })

  it('sorterer æøå riktig', () => {
    expect(deckOrder([p('3', 'Åse'), p('1', 'Øyvind'), p('2', 'Zara'), p('0', 'Ærlend')])).toEqual(['2', '0', '1', '3'])
  })
})

describe('pullRelated', () => {
  const people = [p('a', 'Kari Nordmann'), p('b', 'Per Hansen', { email: 'per@firma.no' }), p('c', 'Ola Nordmann'), p('d', 'Lise Berg', { email: 'lise@firma.no' })]

  it('flytter folk med samme etternavn fram', () => {
    expect(pullRelated(['b', 'c', 'd'], people[0], people)).toEqual(['c', 'b', 'd'])
  })

  it('flytter folk med samme e-postdomene fram, men ikke vanlige postkasser', () => {
    expect(pullRelated(['a', 'c', 'd'], people[1], people)).toEqual(['d', 'a', 'c'])
    const gmail = [p('x', 'X Y', { email: 'x@gmail.com' }), p('z', 'Z W', { email: 'z@gmail.com' }), p('q', 'Q R')]
    expect(pullRelated(['q', 'z'], gmail[0], gmail)).toEqual(['q', 'z'])
  })

  it('lar rekkefølgen stå når ingen er beslektet', () => {
    expect(pullRelated(['c', 'd'], p('z', 'Zed Zulu'), people)).toEqual(['c', 'd'])
  })
})

describe('missingPairs', () => {
  it('gir alle par som mangler, uansett retning på de eksisterende', () => {
    expect(missingPairs(['a', 'b', 'c'], [['b', 'a']])).toEqual([
      ['a', 'c'],
      ['b', 'c'],
    ])
  })

  it('gir ingenting for én person, og fjerner duplikater', () => {
    expect(missingPairs(['a'], [])).toEqual([])
    expect(missingPairs(['a', 'a', 'b'], [])).toEqual([['a', 'b']])
  })
})

describe('newPairs', () => {
  it('dropper par med seg selv, par som finnes, og samme par to ganger', () => {
    expect(
      newPairs(
        [
          ['a', 'a'],
          ['a', 'b'],
          ['c', 'a'],
          ['a', 'c'],
          ['b', 'c'],
        ],
        [['b', 'a']],
      ),
    ).toEqual([
      ['c', 'a'],
      ['b', 'c'],
    ])
  })
})

describe('closenessPreset', () => {
  it('setter type og påminnelse i ett', () => {
    expect(closenessPreset('close')).toEqual({ type: 'FRIEND', cadenceWeeks: 4 })
    expect(closenessPreset('family')).toEqual({ type: 'FAMILY', cadenceWeeks: 3 })
    expect(closenessPreset('sometimes')).toEqual({ type: 'FRIEND', cadenceWeeks: 12 })
    expect(closenessPreset('peripheral')).toEqual({ type: 'ACQUAINTANCE', cadenceWeeks: null })
  })
})

describe('networkHints', () => {
  // Første kort: Per (p1) kjenner hele familien sin og to av dine.
  const pairs: [string, string][] = [
    ['p1', 'p2'],
    ['p1', 'p3'],
    ['p1', 'p4'],
    ['p1', 'mamma'],
    ['p1', 'meg'],
    ['p3', 'p4'],
  ]
  const tagsOf = new Map([
    ['p1', ['vennefamilie']],
    ['p3', ['vennefamilie']],
  ])

  it('viser hvem neste kort allerede kjenner', () => {
    expect(networkHints('p2', pairs, tagsOf).already).toEqual(['p1'])
  })

  it('velger miljøet flertallet av dem hun kjenner er i', () => {
    expect(networkHints('p2', pairs, tagsOf).tagIds).toEqual(['vennefamilie'])
    expect(networkHints('ny', pairs, tagsOf)).toEqual({ already: [], tagIds: [] })
  })
})

describe('defaultCadence', () => {
  it('følger typen, og en eks eller bekjent får ingen påminnelse', () => {
    expect(defaultCadence('FRIEND')).toBe(4)
    expect(defaultCadence('FAMILY')).toBe(4)
    expect(defaultCadence('COLLEAGUE')).toBe(12)
    expect(defaultCadence('ROMANTIC', 'PARTNER')).toBe(2)
    expect(defaultCadence('ROMANTIC')).toBe(2)
    expect(defaultCadence('ROMANTIC', 'ENDED')).toBeNull()
    expect(defaultCadence('ACQUAINTANCE')).toBeNull()
  })
})

describe('rankKnows', () => {
  const people = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, tagIds: id === 'e' ? ['radio'] : [] }))
  const pairs: [string, string][] = [
    ['a', 'c'],
    ['b', 'c'],
    ['b', 'd'],
  ]

  it('vokser med det du krysser av: hver kjent gir sine bekjente', () => {
    expect(rankKnows('x', [], pairs, [], people)).toEqual([])
    expect(rankKnows('x', ['a'], pairs, [], people)).toEqual(['c'])
    // Med b også: c kjenner begge (høyest), d kjenner b.
    expect(rankKnows('x', ['a', 'b'], pairs, [], people)).toEqual(['c', 'd'])
  })

  it('tar med samme miljø, men under nettverket', () => {
    expect(rankKnows('x', ['a'], pairs, ['radio'], people)).toEqual(['c', 'e'])
  })
})
