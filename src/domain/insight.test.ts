import { describe, it, expect } from 'vitest'
import { byPrimaryTag, byType, rhythm, topPeople, unseenBands, weekly } from './insight'

const day = (iso: string) => new Date(`${iso}T12:00:00Z`)
const now = day('2026-09-26')

describe('unseenBands', () => {
  it('fordeler etter tid siden sist, lengst siden først, og utelater de nylige', () => {
    const bands = unseenBands(
      [
        { id: 'recent', lastContact: day('2026-08-01') },
        { id: 'q1', lastContact: day('2026-06-01') },
        { id: 'q2', lastContact: day('2026-05-01') },
        { id: 'half', lastContact: day('2026-01-10') },
        { id: 'year', lastContact: day('2024-03-01') },
        { id: 'never', lastContact: null },
      ],
      now,
    )
    expect(bands.year.map((p) => p.id)).toEqual(['year'])
    expect(bands.half.map((p) => p.id)).toEqual(['half'])
    expect(bands.quarter.map((p) => p.id)).toEqual(['q2', 'q1'])
    expect(bands.never.map((p) => p.id)).toEqual(['never'])
  })

  it('legger nøyaktig 90 dager i «tre måneder»', () => {
    const bands = unseenBands([{ id: 'x', lastContact: new Date(now.getTime() - 90 * 86_400_000) }], now)
    expect(bands.quarter).toHaveLength(1)
  })
})

describe('byPrimaryTag', () => {
  const primary = new Map<string, string | null>([
    ['a', 'radio'],
    ['b', 'radio'],
    ['c', 'klatring'],
    ['d', null],
  ])

  it('teller en logg én gang per distinkte hovedtagg', () => {
    const result = byPrimaryTag([{ personIds: ['a', 'b'] }, { personIds: ['a', 'c'] }, { personIds: ['d'] }], primary)
    expect(result).toEqual([
      { tagId: 'radio', count: 2 },
      { tagId: 'klatring', count: 1 },
      { tagId: null, count: 1 },
    ])
  })
})

describe('byType', () => {
  it('teller per type, uten type som annet', () => {
    expect(byType([{ type: 'MET' }, { type: 'MET' }, { type: 'CALL' }, { type: null }])).toEqual({ MET: 2, CALL: 1, OTHER: 1 })
  })
})

describe('topPeople', () => {
  it('sorterer på antall og tar med datoene', () => {
    const top = topPeople(
      [
        { date: day('2026-09-01'), personIds: ['a', 'b'] },
        { date: day('2026-09-10'), personIds: ['a'] },
      ],
      1,
    )
    expect(top).toEqual([{ personId: 'a', count: 2, dates: [day('2026-09-01'), day('2026-09-10')] }])
  })
})

describe('weekly', () => {
  it('tar med tomme uker og starter på mandag', () => {
    const weeks = weekly([{ date: day('2026-09-02') }, { date: day('2026-09-03') }], day('2026-08-31'), day('2026-09-20'))
    expect(weeks.map((w) => [w.start.toISOString().slice(0, 10), w.count])).toEqual([
      ['2026-08-31', 2],
      ['2026-09-07', 0],
      ['2026-09-14', 0],
    ])
  })

  it('krysser årsskiftet med riktig ukenummer', () => {
    const weeks = weekly([{ date: day('2027-01-01') }], day('2026-12-28'), day('2027-01-05'))
    expect(weeks.map((w) => w.week)).toEqual([53, 1])
    expect(weeks[0].count).toBe(1)
  })
})

describe('rhythm', () => {
  it('er null med færre enn tre logger', () => {
    expect(rhythm([day('2026-09-01'), day('2026-09-10')])).toBeNull()
  })

  it('er medianen av intervallene, så én lang pause ikke drar opp', () => {
    expect(rhythm([day('2026-01-01'), day('2026-06-01'), day('2026-06-08'), day('2026-06-15'), day('2026-06-22')])).toBe(7)
  })

  it('teller flere logger samme dag som én', () => {
    expect(rhythm([day('2026-09-01'), day('2026-09-01'), day('2026-09-05')])).toBeNull()
  })

  it('bruker bare de ti siste', () => {
    const old = [day('2020-01-01'), day('2021-01-01')]
    const recent = Array.from({ length: 10 }, (_, i) => day(`2026-09-${String(i * 2 + 1).padStart(2, '0')}`))
    expect(rhythm([...old, ...recent])).toBe(2)
  })
})
