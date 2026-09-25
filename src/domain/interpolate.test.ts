import { describe, it, expect } from 'vitest'
import { interpolate, easeInOut } from './interpolate'

describe('interpolate', () => {
  const from = new Map([['a', { x: 0, y: 0 }]])
  const to = new Map([
    ['a', { x: 100, y: -50 }],
    ['b', { x: 10, y: 10 }],
  ])
  it('går fra start til mål', () => {
    expect(interpolate(from, to, 0).get('a')).toEqual({ x: 0, y: 0 })
    expect(interpolate(from, to, 1).get('a')).toEqual({ x: 100, y: -50 })
    expect(interpolate(from, to, 0.5).get('a')).toEqual({ x: 50, y: -25 })
  })
  it('noder uten startpunkt står i mål med én gang', () => {
    expect(interpolate(from, to, 0.2).get('b')).toEqual({ x: 10, y: 10 })
  })
  it('easeInOut er 0 og 1 i endene og symmetrisk', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeCloseTo(0.5)
  })
})
