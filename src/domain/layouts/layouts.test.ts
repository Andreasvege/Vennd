import { describe, it, expect } from 'vitest'
import { connectionOrder } from './order'
import { tidyNetwork } from './tidy'
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

describe('relax', () => {
  it('skyver personer som overlapper fra hverandre, uten å flytte dem langt', async () => {
    const { relax } = await import('./relax')
    const start = new Map([
      ['a', { x: 0, y: 100 }],
      ['b', { x: 10, y: 100 }],
      ['c', { x: 500, y: 0 }],
    ])
    const out = relax(start, 80)
    const d = Math.hypot(out.get('a')!.x - out.get('b')!.x, out.get('a')!.y - out.get('b')!.y)
    expect(d).toBeGreaterThanOrEqual(79)
    expect(out.get('c')).toEqual({ x: 500, y: 0 })
    expect(Math.hypot(out.get('a')!.x, out.get('a')!.y - 100)).toBeLessThan(60)
  })
  it('tåler personer som står på nøyaktig samme sted', async () => {
    const { relax } = await import('./relax')
    const out = relax(new Map([['a', { x: 0, y: 0 }], ['b', { x: 0, y: 0 }]]), 80)
    expect(Number.isFinite(out.get('a')!.x)).toBe(true)
    expect(Math.hypot(out.get('a')!.x - out.get('b')!.x, out.get('a')!.y - out.get('b')!.y)).toBeGreaterThanOrEqual(79)
  })
})

describe('connectionOrder', () => {
  const m = (id: string, name = id) => ({ id, name })

  it('uten relasjoner: alfabetisk', () => {
    expect(connectionOrder([m('c', 'Cecilie'), m('a', 'Anders'), m('b', 'Bjørn')], [])).toEqual(['a', 'b', 'c'])
  })

  it('setter de som henger sammen, ved siden av hverandre, største klynge først', () => {
    // Familien (a–d–e) og paret (b–c) skal ikke blandes alfabetisk.
    const order = connectionOrder(
      [m('a', 'A'), m('b', 'B'), m('c', 'C'), m('d', 'D'), m('e', 'E'), m('f', 'F')],
      [
        ['a', 'd'],
        ['d', 'e'],
        ['b', 'c'],
      ],
    )
    expect(order).toEqual(['d', 'a', 'e', 'b', 'c', 'f'])
  })

  it('ignorerer relasjoner til folk utenfor gruppen', () => {
    expect(connectionOrder([m('a', 'A'), m('b', 'B')], [['a', 'x']])).toEqual(['a', 'b'])
  })
})

describe('tidyNetwork', () => {
  const groups = [
    { id: 'fam', name: 'Familie' },
    { id: 'radio', name: 'Studentradio' },
  ]
  const persons = [
    ...['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, name: id, groupId: 'fam' })),
    ...['p', 'q', 'r', 's'].map((id) => ({ id, name: id, groupId: 'radio' })),
    { id: 'z', name: 'z', groupId: null },
  ]
  const pairs: [string, string][] = [
    ['a', 'b'],
    ['b', 'c'],
    ['c', 'd'],
    ['p', 'q'],
    ['q', 'r'],
  ]
  const pos = tidyNetwork(persons, groups, pairs)
  const dist = (x: string, y: string) => Math.hypot(pos.get(x)!.x - pos.get(y)!.x, pos.get(x)!.y - pos.get(y)!.y)

  it('plasserer alle, uten overlapp og unna midten', () => {
    expect(pos.size).toBe(persons.length)
    for (const p of persons) for (const q of persons) if (p.id < q.id) expect(dist(p.id, q.id)).toBeGreaterThanOrEqual(99)
    for (const p of pos.values()) expect(Math.hypot(p.x, p.y)).toBeGreaterThan(120)
  })

  it('holder miljøene samlet: nærmere sine egne enn de andre', () => {
    const inside = (dist('a', 'c') + dist('b', 'd') + dist('p', 'r')) / 3
    const across = (dist('a', 'p') + dist('c', 'r') + dist('d', 's')) / 3
    expect(inside).toBeLessThan(across)
  })

  it('er deterministisk', () => {
    expect(tidyNetwork(persons, groups, pairs)).toEqual(pos)
  })

  it('holder plass rundt «deg» i tyngdepunktet, også når ett miljø er mye større', () => {
    const big = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, name: `r${i}`, groupId: 'radio' }))
    const clique = big.flatMap((a, i) => big.slice(i + 1).map((b) => [a.id, b.id] as [string, string]))
    const all = [...big, ...persons.filter((p) => p.groupId !== 'radio')]
    const out = tidyNetwork(all, groups, [...pairs, ...clique])
    const pts = [...out.values()]
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
    expect(Math.hypot(cx, cy)).toBeLessThan(1)
    for (const p of pts) expect(Math.hypot(p.x - cx, p.y - cy)).toBeGreaterThan(120)
  })
})
