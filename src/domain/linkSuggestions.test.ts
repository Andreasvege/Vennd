import { describe, it, expect } from 'vitest'
import { answeredPairs, groupClusters, idByName, insightPairs, linkCandidates, withAssessments, type LinkCandidate, type LinkPerson, type LinkRelation, type LinkRow } from './linkSuggestions'

const person = (id: string, name: string, tagIds: string[] = []): LinkPerson => ({ id, name, tagIds })
const rel = (from: string, to: string, type: LinkRelation['type'] = 'FRIEND', label: string | null = null): LinkRelation => ({
  from,
  to,
  type,
  label,
})

describe('linkCandidates', () => {
  // Nora er kusinen til fire søsken som ikke er koblet til hverandre ennå.
  const family = [
    person('nora', 'Nora Hjorthaug'),
    person('havard', 'Håvard Vege'),
    person('hanne', 'Hanne Vege'),
    person('selma', 'Selma Vege'),
    person('august', 'August Vege'),
  ]
  const cousins = ['havard', 'hanne', 'selma', 'august'].map((id) => rel('nora', id, 'FAMILY', 'kusine'))

  it('foreslår alle par blant søsknene, som familie, på grunn av felles kusine og etternavn', () => {
    const out = linkCandidates(family, cousins)
    expect(out).toHaveLength(6)
    expect(out.every((c) => c.type === 'FAMILY' && c.sameSurname && c.shared.includes('nora'))).toBe(true)
  })

  it('krever mer enn én felles venn når ingenting annet peker samme vei', () => {
    const people = [person('m', 'Martin Nilsen'), person('a', 'Anna Berg'), person('b', 'Bjørn Dahl')]
    expect(linkCandidates(people, [rel('m', 'a'), rel('m', 'b')])).toEqual([])
  })

  it('godtar én felles venn når de er i samme miljø', () => {
    const people = [person('m', 'Martin Nilsen'), person('a', 'Anna Berg', ['radio']), person('b', 'Bjørn Dahl', ['radio'])]
    const [c] = linkCandidates(people, [rel('m', 'a'), rel('m', 'b')])
    expect(c).toMatchObject({ a: 'a', b: 'b', type: 'FRIEND', sharedTags: ['radio'] })
  })

  it('foreslår med to felles venner, og rangerer de sterkeste først', () => {
    const people = [person('x', 'X X'), person('y', 'Y Y'), person('a', 'A A'), person('b', 'B B'), person('c', 'C C')]
    const out = linkCandidates(people, [rel('x', 'a'), rel('x', 'b'), rel('y', 'a'), rel('y', 'b'), rel('x', 'c'), rel('y', 'c'), rel('a', 'z')])
    // x og y deler tre bekjente (a, b og c): det sterkeste forslaget.
    expect(out[0]).toMatchObject({ a: 'x', b: 'y' })
    expect(out[0].shared).toHaveLength(3)
    expect(out.map((c) => `${c.a}-${c.b}`)).toEqual(expect.arrayContaining(['a-b', 'a-c', 'b-c']))
  })

  it('hopper over par som finnes, er avvist, eller gjelder folk som ikke er med', () => {
    const withLink = [...cousins, rel('hanne', 'havard', 'FAMILY')]
    const out = linkCandidates(family, withLink, new Set(['havard|selma']))
    const keys = out.map((c) => `${c.a}|${c.b}`)
    expect(keys).not.toContain('hanne|havard')
    expect(keys).not.toContain('havard|selma')
    const partial = linkCandidates(family.filter((p) => p.id !== 'august'), cousins)
    expect(partial.some((c) => c.a === 'august' || c.b === 'august')).toBe(false)
  })

  it('ordner paret alfabetisk på id, så det er entydig', () => {
    const [c] = linkCandidates(family, cousins).filter((x) => x.a === 'august' || x.b === 'august')
    expect(c.a < c.b).toBe(true)
  })
})

describe('withAssessments', () => {
  const c = (a: string, b: string): LinkCandidate => ({ a, b, score: 4, shared: ['x'], sameSurname: true, sharedTags: [], type: 'FRIEND' })
  const row = (aId: string, bId: string, extra: Partial<LinkRow> = {}): LinkRow => ({
    aId,
    bId,
    status: 'OPEN',
    assessed: true,
    keep: true,
    type: 'FAMILY',
    label: 'søsken',
    reason: 'Begge er søskenbarn av Nora.',
    ...extra,
  })

  it('legger Claudes type, etikett og begrunnelse oppå regelforslaget', () => {
    expect(withAssessments([c('a', 'b')], [row('a', 'b')])[0]).toMatchObject({ type: 'FAMILY', label: 'søsken', fromClaude: true })
  })

  it('skjuler det Claude sier nei til, og det du har svart på', () => {
    const rows = [row('a', 'b', { keep: false }), row('a', 'c', { status: 'DISMISSED' })]
    expect(withAssessments([c('a', 'b'), c('a', 'c'), c('b', 'c')], rows).map((v) => `${v.a}${v.b}`)).toEqual(['bc'])
  })

  it('viser regelforslaget som det er når Claude ikke har vurdert det', () => {
    expect(withAssessments([c('a', 'b')], [])[0]).toMatchObject({ type: 'FRIEND', label: null, fromClaude: false })
  })

  it('answeredPairs gir bare par du har svart på', () => {
    expect([...answeredPairs([row('a', 'b'), row('b', 'c', { status: 'ACCEPTED' })])]).toEqual(['b|c'])
  })
})

describe('idByName', () => {
  it('slår opp navn bare når de er entydige', () => {
    const find = idByName([
      { id: '1', name: 'Håvard Vege' },
      { id: '2', name: 'Anna Berg' },
      { id: '3', name: 'Anna Berg' },
    ])
    expect(find(' håvard vege ')).toBe('1')
    expect(find('Anna Berg')).toBeNull()
    expect(find('Ukjent')).toBeNull()
  })
})

describe('groupClusters', () => {
  const rel = (from: string, to: string, type: LinkRelation['type'] = 'FRIEND'): LinkRelation => ({ from, to, type, label: null })

  it('Noras kusiner blir ett spørsmål om Vege-ene', () => {
    const family = ['nora', 'havard', 'hanne', 'selma', 'august'].map((id) => ({
      id,
      name: id === 'nora' ? 'Nora Hjorthaug' : `${id} Vege`,
      tagIds: [],
      groupId: null,
    }))
    const rels = ['havard', 'hanne', 'selma', 'august'].map((id) => rel('nora', id, 'FAMILY'))
    const clusters = groupClusters(linkCandidates(family, rels), family, rels, new Map())
    expect(clusters).toHaveLength(1)
    expect(clusters[0]).toMatchObject({ b: null, type: 'FAMILY', hubs: ['nora'] })
    expect(clusters[0].a.label).toBe('Vege')
    expect(clusters[0].pairs).toHaveLength(6)
  })

  it('en som kjenner nesten alle, er ikke et tegn: da blir det ingen spørsmål', () => {
    const people = Array.from({ length: 20 }, (_, i) => ({ id: `p${i}`, name: `P${i} Navn${i}`, tagIds: [], groupId: null }))
    const hub = { id: 'mari', name: 'Mari Hub', tagIds: [], groupId: null }
    const rels = people.map((p) => rel('mari', p.id))
    expect(groupClusters(linkCandidates([hub, ...people], rels), [hub, ...people], rels, new Map())).toEqual([])
  })

  it('deler i spørsmål innad i et miljø og mellom to miljøer', () => {
    const people = [
      { id: 'a', name: 'A A', tagIds: ['radio'], groupId: 'radio' },
      { id: 'b', name: 'B B', tagIds: ['radio'], groupId: 'radio' },
      { id: 'c', name: 'C C', tagIds: ['klatring'], groupId: 'klatring' },
      { id: 'x', name: 'X X', tagIds: [], groupId: null },
      { id: 'y', name: 'Y Y', tagIds: [], groupId: null },
    ]
    const rels = [rel('x', 'a'), rel('x', 'b'), rel('x', 'c'), rel('y', 'a'), rel('y', 'b'), rel('y', 'c')]
    const clusters = groupClusters(linkCandidates(people, rels), people, rels, new Map([['radio', 'Radio Nova'], ['klatring', 'Klatring']]))
    const labels = clusters.map((c) => [c.a.label, c.b?.label ?? null, c.pairs.length])
    expect(labels).toContainEqual(['Klatring', 'Radio Nova', 2])
    expect(labels).toContainEqual(['Radio Nova', null, 1])
  })
})

describe('insightPairs', () => {
  it('group gir alle par, hub gir navet til hver', () => {
    expect(insightPairs('group', null, ['a', 'b', 'c'])).toHaveLength(3)
    expect(insightPairs('hub', 'n', ['a', 'b', 'n'])).toEqual([
      ['n', 'a'],
      ['n', 'b'],
    ])
  })
})
