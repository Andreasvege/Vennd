import { describe, it, expect } from 'vitest'
import { resolveSuggestions, type SuggestContext } from './suggestions'

const context: SuggestContext = {
  participants: [
    { id: 'ingrid', name: 'Ingrid Aas', facts: [{ label: 'Jobb', value: 'Statkraft' }], openThreads: ['Budet på leiligheten'] },
    { id: 'martin', name: 'Martin Nilsen', facts: [], openThreads: [] },
  ],
  persons: [
    { id: 'ingrid', name: 'Ingrid Aas' },
    { id: 'martin', name: 'Martin Nilsen' },
    { id: 'hanna', name: 'Hanna Berg' },
    { id: 'jonas1', name: 'Jonas Rud' },
    { id: 'jonas2', name: 'Jonas Lie' },
  ],
}
const now = new Date(2026, 8, 26, 12)
const empty = { threads: [], facts: [], people: [] }

describe('resolveSuggestions', () => {
  it('knytter tråder til deltakerne ved fornavn, med dato for «om en uke»', () => {
    const rows = resolveSuggestions(context, { ...empty, threads: [{ people: ['Ingrid'], title: 'Andre intervjurunde', due: 'week' }] }, now)
    expect(rows).toEqual([{ kind: 'THREAD', payload: { title: 'Andre intervjurunde', personIds: ['ingrid'], dueDate: '2026-10-03' } }])
  })

  it('gir tråden til alle deltakerne når ingen navn stemmer', () => {
    const rows = resolveSuggestions(context, { ...empty, threads: [{ people: ['Kari'], title: 'Hytta', due: 'none' }] }, now)
    expect(rows[0].payload).toMatchObject({ personIds: ['ingrid', 'martin'], dueDate: null })
  })

  it('forkaster tråder som allerede er åpne, og like tråder i samme svar', () => {
    const rows = resolveSuggestions(
      context,
      {
        ...empty,
        threads: [
          { people: ['Ingrid'], title: 'budet på leiligheten', due: 'none' },
          { people: ['Martin'], title: 'Fjellturen', due: 'none' },
          { people: ['Martin'], title: 'Fjellturen ', due: 'month' },
        ],
      },
      now,
    )
    expect(rows.map((r) => r.payload)).toEqual([{ title: 'Fjellturen', personIds: ['martin'], dueDate: null }])
  })

  it('forkaster fakta som finnes fra før og fakta om ukjente', () => {
    const rows = resolveSuggestions(
      context,
      {
        ...empty,
        facts: [
          { person: 'Ingrid Aas', label: 'jobb', value: 'statkraft' },
          { person: 'Ingrid', label: 'Bor', value: 'Grünerløkka' },
          { person: 'Kari', label: 'Jobb', value: 'NRK' },
        ],
      },
      now,
    )
    expect(rows).toEqual([{ kind: 'FACT', payload: { personId: 'ingrid', label: 'Bor', value: 'Grünerløkka' } }])
  })

  it('foreslår kjente som deltakere og ukjente som nye personer, men ikke tvetydige navn', () => {
    const rows = resolveSuggestions(
      context,
      { ...empty, people: [{ name: 'Hanna' }, { name: 'Kari Nordmann' }, { name: 'Jonas' }, { name: 'Martin' }] },
      now,
    )
    expect(rows).toEqual([
      { kind: 'PARTICIPANT', payload: { personId: 'hanna' } },
      { kind: 'PERSON', payload: { name: 'Kari Nordmann' } },
    ])
  })

  it('holder seg innenfor maks antall per type', () => {
    const threads = Array.from({ length: 6 }, (_, i) => ({ people: ['Ingrid'], title: `Tråd ${i}`, due: 'none' as const }))
    expect(resolveSuggestions(context, { ...empty, threads }, now)).toHaveLength(3)
  })
})

describe('resolveSuggestions: forbindelser', () => {
  const ctx = {
    participants: [{ id: 'i', name: 'Ingrid Aas', facts: [], openThreads: [] }],
    persons: [
      { id: 'i', name: 'Ingrid Aas' },
      { id: 'j', name: 'Jonas Rud' },
      { id: 'm', name: 'Martin Nilsen' },
    ],
    pairs: [['i', 'm']] as [string, string][],
  }
  const out = { threads: [], facts: [], people: [] }

  it('foreslår en forbindelse mellom to du har, men ikke en som finnes eller med et ukjent navn', () => {
    const rows = resolveSuggestions(ctx, {
      ...out,
      relations: [
        { a: 'Ingrid', b: 'Jonas Rud', type: 'ROMANTIC', label: 'kjærester' },
        { a: 'Ingrid', b: 'Martin', type: 'FRIEND', label: null },
        { a: 'Ingrid', b: 'Erik', type: 'FAMILY', label: null },
      ],
    })
    expect(rows).toEqual([{ kind: 'RELATIONSHIP', payload: { aId: 'i', bId: 'j', type: 'ROMANTIC', label: 'kjærester' } }])
  })
})
