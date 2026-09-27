import { describe, expect, it } from 'vitest'
import { resolveTell, type ClaudeTell, type TellContext } from './tell'

const ctx: TellContext = {
  subject: { id: 'ingrid', name: 'Ingrid Aas', relationLabel: null, hasBirthday: false, tagIds: ['radio'], facts: [{ label: 'Jobb', value: 'NRK' }] },
  persons: [
    { id: 'ingrid', name: 'Ingrid Aas' },
    { id: 'jonas', name: 'Jonas Rud' },
    { id: 'martin', name: 'Martin Nilsen' },
    { id: 'martin2', name: 'Martin Berg' },
  ],
  tags: [
    { id: 'radio', name: 'Studentradio' },
    { id: 'klatring', name: 'Klatring' },
  ],
  pairs: [['ingrid', 'martin']],
}

const empty: ClaudeTell = { relationLabel: null, birthday: null, groups: [], facts: [], relations: [], threads: [] }

describe('resolveTell', () => {
  it('gir ingenting når Claude ikke fant noe', () => {
    expect(resolveTell(ctx, empty)).toEqual([])
  })

  it('om henne: etikett, bursdag uten år, og miljø som finnes eller er nytt', () => {
    const rows = resolveTell(ctx, {
      ...empty,
      relationLabel: 'studievenn',
      birthday: { day: 3, month: 3, year: null },
      groups: ['klatring', 'Studentradio', 'Bokklubb'],
    })
    expect(rows).toEqual([
      { kind: 'LABEL', personId: 'ingrid', label: 'studievenn' },
      { kind: 'BIRTHDAY', personId: 'ingrid', date: '1900-03-03' },
      { kind: 'GROUP', personId: 'ingrid', tagId: 'klatring', name: 'Klatring' },
      { kind: 'GROUP', personId: 'ingrid', tagId: null, name: 'Bokklubb' },
    ])
  })

  it('forkaster en dato som ikke finnes', () => {
    expect(resolveTell(ctx, { ...empty, birthday: { day: 31, month: 2, year: 1995 } })).toEqual([])
  })

  it('fakta om henne og andre, men ikke det hun alt har', () => {
    const rows = resolveTell(ctx, {
      ...empty,
      facts: [
        { person: 'Ingrid', label: 'Jobb', value: 'NRK' },
        { person: 'Ingrid', label: 'Bor', value: 'Tøyen' },
        { person: 'Jonas', label: 'Jobb', value: 'Equinor' },
        { person: 'Ukjent Person', label: 'Bor', value: 'Oslo' },
      ],
    })
    expect(rows).toEqual([
      { kind: 'FACT', personId: 'ingrid', name: 'Ingrid Aas', label: 'Bor', value: 'Tøyen' },
      { kind: 'FACT', personId: 'jonas', name: 'Jonas Rud', label: 'Jobb', value: 'Equinor' },
    ])
  })

  it('forbindelser: kjente og nye navn, men ikke det som finnes, og ikke tvetydige fornavn', () => {
    const rows = resolveTell(ctx, {
      ...empty,
      relations: [
        { a: 'Ingrid', b: 'Jonas Rud', type: 'ROMANTIC', label: 'kjærester' },
        { a: 'Ingrid', b: 'Martin Nilsen', type: 'FRIEND', label: null },
        { a: 'Ingrid', b: 'Erik Aas', type: 'FAMILY', label: 'bror' },
        { a: 'Ingrid', b: 'Martin', type: 'FRIEND', label: null },
        { a: 'Per', b: 'Pål', type: 'FRIEND', label: null },
      ],
    })
    expect(rows).toEqual([
      { kind: 'RELATION', a: { id: 'ingrid', name: 'Ingrid Aas' }, b: { id: 'jonas', name: 'Jonas Rud' }, type: 'ROMANTIC', label: 'kjærester' },
      { kind: 'RELATION', a: { id: 'ingrid', name: 'Ingrid Aas' }, b: { id: null, name: 'Erik Aas' }, type: 'FAMILY', label: 'bror' },
    ])
  })

  it('tråder gjelder henne når ingen er nevnt', () => {
    const rows = resolveTell(ctx, { ...empty, threads: [{ people: [], title: 'Flyttingen til Bergen', due: 'none' }] })
    expect(rows).toEqual([{ kind: 'THREAD', title: 'Flyttingen til Bergen', personIds: ['ingrid'], dueDate: null }])
  })
})
