import { describe, it, expect } from 'vitest'
import { sectors } from './sectors'
import { nearness } from './nearness'
import { circles, bundlePath } from './circles'
import { hull } from './hulls'

const groups = [
  { id: 'radio', name: 'Studentradio' },
  { id: 'klatring', name: 'Klatring' },
  { id: 'tom', name: 'Tom gruppe' },
]
const persons = [
  { id: 'ingrid', name: 'Ingrid', groupId: 'radio', freshness: 1 },
  { id: 'martin', name: 'Martin', groupId: 'radio', freshness: 0 },
  { id: 'jonas', name: 'Jonas', groupId: 'klatring', freshness: 0.5 },
  { id: 'nils', name: 'Nils', groupId: null, freshness: 0 },
]
const dist = (p: { x: number; y: number }) => Math.hypot(p.x, p.y)
const angleOf = (p: { x: number; y: number }) => {
  // Fra rett opp, med klokka, 0..2π — samme måling som sektorene.
  const a = Math.atan2(p.y, p.x) + Math.PI / 2
  return a < 0 ? a + 2 * Math.PI : a
}

describe('sectors', () => {
  it('hopper over tomme grupper, gir plass etter antall og legger «uten tagg» sist', () => {
    const s = sectors(groups, persons)
    expect(s.map((x) => x.groupId)).toEqual(['radio', 'klatring', null])
    const size = (x: (typeof s)[number]) => x.end - x.start
    expect(size(s[0])).toBeCloseTo(2 * size(s[1]), 5)
  })
  it('sorterer medlemmer alfabetisk', () => {
    expect(sectors(groups, persons)[0].members).toEqual(['ingrid', 'martin'])
  })
  it('tåler ingen personer', () => {
    expect(sectors(groups, [])).toEqual([])
  })
})

describe('nearness', () => {
  it('fersk kontakt står innerst, gammel ytterst', () => {
    const pos = nearness(persons, groups, { rMin: 100, rMax: 500 })
    expect(dist(pos.get('ingrid')!)).toBeCloseTo(100)
    expect(dist(pos.get('martin')!)).toBeCloseTo(500)
    expect(dist(pos.get('jonas')!)).toBeCloseTo(300)
  })
  it('er stabil: samme input gir samme plass', () => {
    expect(nearness(persons, groups)).toEqual(nearness(persons, groups))
  })
  it('holder gruppen samlet i sin sektor', () => {
    const [radio] = sectors(groups, persons)
    const pos = nearness(persons, groups)
    for (const id of radio.members) {
      const a = angleOf(pos.get(id)!)
      expect(a).toBeGreaterThanOrEqual(radio.start - 1e-9)
      expect(a).toBeLessThanOrEqual(radio.end + 1e-9)
    }
  })
  it('én person uten grupper gir et tall, ikke NaN', () => {
    const p = nearness([{ id: 'x', name: 'X', groupId: null, freshness: 0.3 }], []).get('x')!
    expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
  })
})

describe('circles', () => {
  it('setter alle på samme radius, med et anker per gruppe', () => {
    const c = circles(persons, groups, { r: 400 })
    for (const p of c.positions.values()) expect(dist(p)).toBeCloseTo(400)
    expect([...c.anchors.keys()]).toEqual(['radio', 'klatring', null])
    for (const a of c.anchors.values()) expect(dist(a)).toBeCloseTo(140)
  })
  it('kanter mellom de samme gruppene går gjennom de samme ankrene', () => {
    const c = circles(persons, groups, { r: 400 })
    const a = c.anchors.get('radio')!
    const b = c.anchors.get('klatring')!
    const p1 = bundlePath(c.positions.get('ingrid')!, c.positions.get('jonas')!, a, b)
    const p2 = bundlePath(c.positions.get('martin')!, c.positions.get('jonas')!, a, b)
    const mid = (s: string) => s.split(' C ')[1].split(' ').slice(0, 2).join(' ')
    expect(mid(p1)).toBe(mid(p2))
  })
})

describe('hull', () => {
  it('trenger minst to punkter', () => {
    expect(hull([])).toBeNull()
    expect(hull([{ x: 0, y: 0 }])).toBeNull()
  })
  it('gir en lukket bane for to punkter', () => {
    const path = hull([{ x: 0, y: 0 }, { x: 100, y: 0 }])!
    expect(path.startsWith('M')).toBe(true)
    expect(path.trim().endsWith('Z')).toBe(true)
  })
  it('er fritt for NaN når punktene ligger oppå hverandre', () => {
    expect(hull([{ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }])).not.toMatch(/NaN/)
  })
})
