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
  it('med minRadius: skyver ingen innenfor den innerste ringen, der du står', async () => {
    const { relax } = await import('./relax')
    // Seks ferske i en smal sektor, alle på ringen: trengsel som før dyttet noen inn mot midten.
    const start = new Map(
      Array.from({ length: 6 }, (_, i) => [`p${i}`, { x: 140 * Math.cos(i * 0.12), y: 140 * Math.sin(i * 0.12) }]),
    )
    const out = relax(start, 104, 60, { minRadius: 140 })
    const pts = [...out.values()]
    for (const p of pts) expect(Math.hypot(p.x, p.y)).toBeGreaterThanOrEqual(139.9)
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThanOrEqual(100)
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

  it('holder plass rundt «deg» i origo, også når ett miljø er mye større', () => {
    const big = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, name: `r${i}`, groupId: 'radio' }))
    const clique = big.flatMap((a, i) => big.slice(i + 1).map((b) => [a.id, b.id] as [string, string]))
    const all = [...big, ...persons.filter((p) => p.groupId !== 'radio')]
    const out = tidyNetwork(all, groups, [...pairs, ...clique])
    for (const p of out.values()) expect(Math.hypot(p.x, p.y)).toBeGreaterThan(120)
  })

  it('legger miljøer med mange felles kjente inntil hverandre', () => {
    // Åtte like miljøer; a og e (motsatt i rekkefølgen) har mange felles
    // kjente, ellers knapt noen.
    const tags = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => ({ id, name: id }))
    const people = tags.flatMap((g) => Array.from({ length: 6 }, (_, i) => ({ id: `${g.id}${i}`, name: `${g.id}${i}`, groupId: g.id })))
    const links: [string, string][] = []
    for (const g of tags) for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) links.push([`${g.id}${i}`, `${g.id}${j}`])
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) links.push([`a${i}`, `e${j}`])
    for (const [g, h] of ['ab', 'bc', 'cd', 'de', 'ef', 'fg', 'gh', 'ha']) links.push([`${g}0`, `${h}0`])
    const out = tidyNetwork(people, tags, links)
    const center = (g: string) => {
      const pts = people.filter((p) => p.groupId === g).map((p) => out.get(p.id)!)
      return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length }
    }
    const gap = (g: string, h: string) => Math.hypot(center(g).x - center(h).x, center(g).y - center(h).y)
    // Kant i kant: like nær som den nærmeste av de andre (flere kan røre a).
    const others = ['b', 'c', 'd', 'f', 'g', 'h'].map((g) => gap('a', g))
    expect(gap('a', 'e')).toBeLessThan(Math.min(...others) + 10)
    expect(gap('a', 'e')).toBeLessThan(others.reduce((s, x) => s + x, 0) / others.length)
  })

  it('setter en uten miljø ved dem hen kjenner, og samler de uten forbindelser alfabetisk', () => {
    const tags = ['a', 'b', 'c'].map((id) => ({ id, name: id }))
    const people = [
      ...tags.flatMap((g) => Array.from({ length: 5 }, (_, i) => ({ id: `${g.id}${i}`, name: `${g.id}${i}`, groupId: g.id as string | null }))),
      { id: 'venn', name: 'Venn', groupId: null },
      ...['Øyvind', 'Anne', 'Kari', 'Berit'].map((name) => ({ id: name, name, groupId: null })),
    ]
    const links: [string, string][] = [
      ['a0', 'a1'],
      ['b0', 'b1'],
      ['c0', 'c1'],
      ['venn', 'c0'],
      ['venn', 'c2'],
      ['venn', 'c3'],
    ]
    const out = tidyNetwork(people, tags, links)
    const d = (x: string, y: string) => Math.hypot(out.get(x)!.x - out.get(y)!.x, out.get(x)!.y - out.get(y)!.y)
    const nearest = (id: string) =>
      people.filter((p) => p.groupId).sort((p, q) => d(id, p.id) - d(id, q.id) || p.id.localeCompare(q.id))[0].groupId
    expect(nearest('venn')).toBe('c')
    // Blokken leses som tekst: linje for linje, venstre mot høyre.
    const reading = ['Anne', 'Berit', 'Kari', 'Øyvind'].map((id) => out.get(id)!)
    for (let i = 1; i < reading.length; i++) {
      const [p, q] = [reading[i - 1], reading[i]]
      expect(q.y > p.y + 1 || (Math.abs(q.y - p.y) <= 1 && q.x > p.x)).toBe(true)
    }
  })

  it('en tett øy med mange forbindelser ut, kommer aldri inn i naboens omriss', () => {
    // Et stort, helt tett miljø der alle kjenner alle i et lite nabomiljø.
    const tags = ['tett', 'nabo'].map((id) => ({ id, name: id }))
    const people = [
      ...Array.from({ length: 36 }, (_, i) => ({ id: `t${i}`, name: `t${i}`, groupId: 'tett' })),
      ...Array.from({ length: 8 }, (_, i) => ({ id: `n${i}`, name: `n${i}`, groupId: 'nabo' })),
    ]
    const links: [string, string][] = []
    for (let i = 0; i < 36; i++) for (let j = i + 1; j < 36; j++) links.push([`t${i}`, `t${j}`])
    for (let i = 0; i < 36; i++) for (let j = 0; j < 8; j++) if ((i + j) % 3 === 0) links.push([`t${i}`, `n${j}`])
    const out = tidyNetwork(people, tags, links)
    for (const p of people.filter((p) => p.groupId === 'tett'))
      for (const q of people.filter((p) => p.groupId === 'nabo'))
        expect(Math.hypot(out.get(p.id)!.x - out.get(q.id)!.x, out.get(p.id)!.y - out.get(q.id)!.y)).toBeGreaterThan(112)
  })

  // Et ekte kart: ~120 personer, 50 av dem i samme krets med undergjenger.
  describe('med et stort, realistisk kart', () => {
    const tags = ['radio', 'fam', 'jobb', 'klatring', 'hjem', 'fhs'].map((id) => ({ id, name: id }))
    const sizes: Record<string, number> = { radio: 50, fam: 14, jobb: 16, klatring: 10, hjem: 9, fhs: 9 }
    const people = Object.entries(sizes).flatMap(([g, n]) =>
      Array.from({ length: n }, (_, i) => ({ id: `${g}${i}`, name: `${g}${i}`, groupId: g as string | null })),
    )
    people.push(...Array.from({ length: 12 }, (_, i) => ({ id: `u${i}`, name: `u${i}`, groupId: null })))
    let seed = 3
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    const links: [string, string][] = []
    for (const a of people)
      for (const b of people) {
        if (a.id >= b.id) continue
        const same = a.groupId !== null && a.groupId === b.groupId
        const sub = same && a.groupId === 'radio' && Number(a.id.slice(5)) % 5 === Number(b.id.slice(5)) % 5
        if (rnd() < (sub ? 0.75 : same ? 0.3 : 0.004)) links.push([a.id, b.id])
      }
    const out = tidyNetwork(people, tags, links)
    const members = (g: string) => people.filter((p) => p.groupId === g).map((p) => out.get(p.id)!)

    it('ingen overlapper, og alle står unna deg', () => {
      const pts = [...out.values()]
      for (let i = 0; i < pts.length; i++) {
        expect(Math.hypot(pts[i].x, pts[i].y)).toBeGreaterThan(120)
        for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThanOrEqual(98)
      }
    })

    it('omrissene til to miljøer overlapper ikke', () => {
      // Omrisset ligger 56 utenfor medlemmene; to omriss trenger 112 imellom.
      for (const a of tags)
        for (const b of tags) {
          if (a.id >= b.id) continue
          for (const p of members(a.id)) for (const q of members(b.id)) expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThan(112)
        }
    })

    it('hvert miljø er en rund øy, ikke en lang pølse', () => {
      for (const g of tags) {
        const pts = members(g.id)
        const w = Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x))
        const h = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y))
        if (pts.length >= 9) expect(Math.max(w, h) / Math.max(1, Math.min(w, h))).toBeLessThan(1.8)
      }
    })

    it('er kompakt: kartet er ikke mye større enn øyene til sammen', () => {
      const pts = [...out.values()]
      const r = Math.max(...pts.map((p) => Math.hypot(p.x, p.y)))
      // 120 personer med ~100 px mellomrom dekker rundt 120 × 100² px².
      expect(Math.PI * r * r).toBeLessThan(120 * 100 * 100 * 6)
    })
  })
})
