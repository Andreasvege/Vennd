import { describe, it, expect } from 'vitest'
import { assertAllOwned, NotOwnedError } from './ownership'

describe('assertAllOwned', () => {
  it('godtar når alle finnes', () => {
    expect(() => assertAllOwned(['a', 'b'], [{ id: 'a' }, { id: 'b' }])).not.toThrow()
  })
  it('avviser når én mangler', () => {
    expect(() => assertAllOwned(['a', 'x'], [{ id: 'a' }])).toThrow(NotOwnedError)
  })
  it('teller duplikater som ett', () => {
    expect(() => assertAllOwned(['a', 'a'], [{ id: 'a' }])).not.toThrow()
  })
  it('avviser en tom forespørsel mot funn som ikke ble bedt om', () => {
    expect(() => assertAllOwned([], [{ id: 'a' }])).toThrow(NotOwnedError)
  })
})
