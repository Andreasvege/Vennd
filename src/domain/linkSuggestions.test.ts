import { describe, it, expect } from 'vitest'
import { answeredPairs, claudeExtras, idByName, linkCandidates, resolveAssessments, withAssessments, type LinkCandidate, type LinkPerson, type LinkRelation, type LinkRow } from './linkSuggestions'

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

describe('resolveAssessments', () => {
  const list: LinkCandidate[] = [{ a: 'a', b: 'b', score: 4, shared: [], sameSurname: false, sharedTags: [], type: 'FRIEND' }]

  it('knytter nummer til par, ignorerer ukjente og doble, og kutter tekst', () => {
    const out = resolveAssessments(list, [
      { n: 1, keep: true, type: 'FAMILY', label: '  søsken  ', reason: 'x'.repeat(300) },
      { n: 1, keep: false, type: 'FRIEND', label: null, reason: 'dobbel' },
      { n: 7, keep: true, type: 'FRIEND', label: null, reason: 'finnes ikke' },
    ])
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ aId: 'a', bId: 'b', label: 'søsken', keep: true })
    expect(out[0].reason).toHaveLength(200)
  })
})

describe('claudeExtras og idByName', () => {
  const row = (aId: string, bId: string, extra: Partial<LinkRow> = {}): LinkRow => ({
    aId, bId, status: 'OPEN', assessed: true, keep: true, type: 'FAMILY', label: 'søsken', reason: 'Samme etternavn.', ...extra,
  })

  it('viser Claudes egne forslag som ikke er regelforslag, koblet eller utenfor kartet', () => {
    const rule: LinkCandidate = { a: 'a', b: 'b', score: 2, shared: [], sameSurname: false, sharedTags: [], type: 'FRIEND' }
    const out = claudeExtras(
      [row('a', 'b'), row('c', 'd'), row('e', 'f'), row('g', 'h', { keep: false }), row('i', 'x')],
      [rule],
      new Set(['e|f']),
      new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']),
    )
    expect(out.map((v) => `${v.a}${v.b}`)).toEqual(['cd'])
    expect(out[0]).toMatchObject({ label: 'søsken', fromClaude: true })
  })

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
