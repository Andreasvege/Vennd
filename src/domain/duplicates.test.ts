import { describe, it, expect } from 'vitest'
import { findDuplicates, normalizeName } from './duplicates'

describe('normalizeName', () => {
  it('ser bort fra bindestrek, aksenter og store bokstaver', () => {
    expect(normalizeName('Nora Broby-Bergem')).toBe(normalizeName('nora  broby bergem'))
    expect(normalizeName('José Ødegård')).toBe('jose ødegård')
  })
})

describe('findDuplicates', () => {
  const persons = [
    { id: '1', name: 'Nora Broby Bergem' },
    { id: '2', name: 'Nora Broby-Bergem' },
    { id: '3', name: 'Solveig Jørpeland Lunde' },
    { id: '4', name: 'Solveig Lunde' },
    { id: '5', name: 'Nora Bakke' },
    { id: '6', name: 'Sander Skumma' },
    { id: '7', name: 'Sander Jordbakke' },
    { id: '8', name: 'Heidrun' },
  ]

  it('finner likt navn med bindestrek, og manglende mellomnavn', () => {
    expect(findDuplicates(persons)).toEqual([
      { a: '1', b: '2', reason: 'same' },
      { a: '3', b: '4', reason: 'middle' },
    ])
  })

  it('hopper over par du har sagt ikke er samme person', () => {
    expect(findDuplicates(persons, new Set(['1|2']))).toEqual([{ a: '3', b: '4', reason: 'middle' }])
  })

  it('samme fornavn alene er ikke nok', () => {
    expect(findDuplicates([{ id: 'a', name: 'Sander Skumma' }, { id: 'b', name: 'Sander Jordbakke' }])).toEqual([])
  })
})
