import { describe, it, expect } from 'vitest'
import { splitPlans, dueFrom } from './plans'

const NOW = new Date(2026, 8, 26, 18, 0) // lørdag 26. sep kl. 18 lokal tid
const plan = (id: string, at: Date, hasTime: boolean) => ({ id, at, hasTime, status: 'PLANNED' as const })

describe('splitPlans', () => {
  it('kommende: fra nå og en uke fram, sortert', () => {
    const { upcoming } = splitPlans(
      [plan('neste', new Date(2026, 9, 2, 12), false), plan('senere-i-kveld', new Date(2026, 8, 26, 20), true), plan('om-to-uker', new Date(2026, 9, 10, 12), false)],
      NOW,
    )
    expect(upcoming.map((p) => p.id)).toEqual(['senere-i-kveld', 'neste'])
  })
  it('et treff med tid er passert når klokka har passert', () => {
    const { awaiting, upcoming } = splitPlans([plan('lunsj', new Date(2026, 8, 26, 12), true)], NOW)
    expect(awaiting.map((p) => p.id)).toEqual(['lunsj'])
    expect(upcoming).toEqual([])
  })
  it('et treff uten tid er fortsatt i dag hele dagen', () => {
    const { awaiting, upcoming } = splitPlans([plan('i-dag', new Date(2026, 8, 26, 12), false)], NOW)
    expect(upcoming.map((p) => p.id)).toEqual(['i-dag'])
    expect(awaiting).toEqual([])
  })
  it('bare planlagte teller', () => {
    const done = { ...plan('ferdig', new Date(2026, 8, 20, 12), false), status: 'DONE' as const }
    expect(splitPlans([done], NOW)).toEqual({ upcoming: [], awaiting: [] })
  })
})

describe('dueFrom', () => {
  it('om en uke og om en måned, som lokal dato', () => {
    expect(dueFrom('week', NOW)).toBe('2026-10-03')
    expect(dueFrom('month', NOW)).toBe('2026-10-26')
  })
  it('ingen gir null, og en valgt dato går rett gjennom', () => {
    expect(dueFrom('none', NOW)).toBeNull()
    expect(dueFrom('2026-12-24', NOW)).toBe('2026-12-24')
  })
})
