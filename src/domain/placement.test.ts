import { describe, it, expect } from 'vitest'
import { placeNewPerson, MIN_GAP } from './placement'

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

describe('placeNewPerson', () => {
  it('plasserer første person i origo', () => {
    expect(placeNewPerson([])).toEqual({ x: 0, y: 0 })
  })

  it('holder minst MIN_GAP til alle eksisterende, også i et tett kart', () => {
    const existing = Array.from({ length: 30 }, (_, i) => ({ x: (i % 6) * 90, y: Math.floor(i / 6) * 90 }))
    const p = placeNewPerson(existing, () => 0.5)
    for (const e of existing) expect(dist(p, e)).toBeGreaterThanOrEqual(MIN_GAP)
  })

  it('lander ikke oppå den ene som finnes', () => {
    const p = placeNewPerson([{ x: 40, y: -20 }], () => 0)
    expect(dist(p, { x: 40, y: -20 })).toBeGreaterThanOrEqual(MIN_GAP)
  })

  it('holder avstand til «Deg» i tyngdepunktet', () => {
    const existing = [{ x: -200, y: 0 }, { x: 200, y: 0 }]
    const p = placeNewPerson(existing, () => 0.5)
    expect(Math.hypot(p.x, p.y)).toBeGreaterThanOrEqual(2 * 110)
  })

  it('er deterministisk gitt samme rng', () => {
    const existing = [{ x: 0, y: 0 }, { x: 100, y: 0 }]
    expect(placeNewPerson(existing, () => 0.25)).toEqual(placeNewPerson(existing, () => 0.25))
  })
})
