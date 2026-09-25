import { describe, it, expect } from 'vitest'
import { derivePairs } from './derivePairs'

describe('derivePairs', () => {
  it('finner par som har vært sammen minst to ganger og ikke er registrert', () => {
    const logs = [{ personIds: ['a', 'b'] }, { personIds: ['b', 'a', 'c'] }, { personIds: ['a', 'c'] }]
    expect(derivePairs(logs, [['a', 'c']])).toEqual([{ a: 'a', b: 'b', count: 2 }])
  })
  it('regner registrerte relasjoner i begge retninger', () => {
    const logs = [{ personIds: ['a', 'b'] }, { personIds: ['a', 'b'] }]
    expect(derivePairs(logs, [['b', 'a']])).toEqual([])
  })
  it('teller ikke logger med én person', () => {
    expect(derivePairs([{ personIds: ['a'] }, { personIds: ['a'] }], [])).toEqual([])
  })
})
