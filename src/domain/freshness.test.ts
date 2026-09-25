import { describe, it, expect } from 'vitest'
import { freshness } from './freshness'

const NOW = new Date('2026-09-26T12:00:00Z')
const weeksAgo = (w: number) => new Date(NOW.getTime() - w * 7 * 86_400_000)

describe('freshness', () => {
  it('er 1 innen halve kadensen', () => {
    expect(freshness(weeksAgo(1), 4, NOW)).toBe(1)
  })
  it('er 0 ved tre ganger kadensen og etter', () => {
    expect(freshness(weeksAgo(12), 4, NOW)).toBe(0)
    expect(freshness(weeksAgo(40), 4, NOW)).toBe(0)
  })
  it('faller lineært mellom', () => {
    // halv (2u) → 1, tre ganger (12u) → 0; 7u er midt imellom
    expect(freshness(weeksAgo(7), 4, NOW)).toBeCloseTo(0.5, 5)
  })
  it('er 0 uten kontakt', () => {
    expect(freshness(null, 4, NOW)).toBe(0)
  })
  it('bruker 26 uker for «aldri påminn»', () => {
    expect(freshness(weeksAgo(10), null, NOW)).toBe(1)
    expect(freshness(weeksAgo(78), null, NOW)).toBe(0)
  })
})
