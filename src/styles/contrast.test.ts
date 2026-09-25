import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast'
import { TOKENS } from './tokens'

describe('contrastRatio', () => {
  it('gir 21 for svart mot hvit', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })
})

describe.each(['light', 'dark'] as const)('tokens (%s)', (mode) => {
  const t = TOKENS[mode]
  it.each([
    ['ink', 'paper', 7],
    ['ink', 'paper-raised', 7],
    ['ink-muted', 'paper', 4.5],
    ['ink-muted', 'paper-raised', 4.5],
    ['pen', 'paper', 4.5],
    ['pen', 'pen-wash', 4.5],
    ['redpencil', 'paper', 4.5],
  ] as const)('%s mot %s ≥ %s:1', (fg, bg, min) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(min)
  })
})
