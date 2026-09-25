import { describe, it, expect } from 'vitest'
import { nextTagColor, personTint } from './palette'

describe('personTint', () => {
  it('bruker hovedtaggens farge', () => {
    expect(personTint({ primaryTag: { color: 'teal' } })).toBe('teal')
  })
  it('faller tilbake til stein uten tagg eller med ukjent farge', () => {
    expect(personTint({ primaryTag: null })).toBe('stone')
    expect(personTint({ primaryTag: { color: '#ff0000' } })).toBe('stone')
  })
})

describe('nextTagColor', () => {
  it('velger første ubrukte farge', () => {
    expect(nextTagColor([])).toBe('sage')
    expect(nextTagColor(['sage', 'ochre'])).toBe('slate')
  })
  it('går rundt når alle er brukt', () => {
    expect(nextTagColor(['sage', 'ochre', 'slate', 'plum', 'rose', 'teal', 'clay', 'stone'])).toBe('sage')
  })
})
