import { describe, it, expect } from 'vitest'
import { t } from '.'

describe('t.rhythm.every', () => {
  it('sier dager, uker eller måneder etter hva som er naturlig', () => {
    expect(t.rhythm.every(1)).toBe('hver dag')
    expect(t.rhythm.every(9)).toBe('hver 9. dag')
    expect(t.rhythm.every(14)).toBe('hver 2. uke')
    expect(t.rhythm.every(8 * 7 - 1)).toBe('hver 8. uke')
    expect(t.rhythm.every(30 * 2)).toBe('hver 2. måned')
    expect(t.rhythm.every(35)).toBe('hver 5. uke')
  })
})
