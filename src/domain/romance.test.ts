import { describe, it, expect } from 'vitest'
import { currentPhase, nextPhase } from './romance'

describe('romanse', () => {
  it('gjeldende fase er den nyeste, uansett rekkefølge i input', () => {
    expect(
      currentPhase([
        { phase: 'SEEING', at: new Date('2026-09-02') },
        { phase: 'FIRST_DATE', at: new Date('2026-08-21') },
      ]),
    ).toBe('SEEING')
  })

  it('ingen faser gir null', () => {
    expect(currentPhase([])).toBeNull()
  })

  it('neste fase følger rekkefølgen og stopper ved PARTNER', () => {
    expect(nextPhase(null)).toBe('FIRST_DATE')
    expect(nextPhase('FIRST_DATE')).toBe('SEEING')
    expect(nextPhase('EXCLUSIVE')).toBe('PARTNER')
    expect(nextPhase('PARTNER')).toBeNull()
    expect(nextPhase('ENDED')).toBeNull()
  })
})
