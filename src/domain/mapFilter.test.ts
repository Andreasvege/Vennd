import { describe, it, expect } from 'vitest'
import { DEFAULT_FILTER, normalize, isPersonVisible, isEdgeVisible, activeCount } from './mapFilter'

describe('mapFilter', () => {
  it('viser en person når minst én tagg er på', () => {
    const f = { ...DEFAULT_FILTER, hiddenTags: ['jobb'] }
    expect(isPersonVisible({ tagIds: ['jobb', 'klatring'] }, f)).toBe(true)
    expect(isPersonVisible({ tagIds: ['jobb'] }, f)).toBe(false)
  })
  it('personer uten tagg følger showUntagged', () => {
    expect(isPersonVisible({ tagIds: [] }, DEFAULT_FILTER)).toBe(true)
    expect(isPersonVisible({ tagIds: [] }, { ...DEFAULT_FILTER, showUntagged: false })).toBe(false)
  })
  it('skjuler kanter til skjulte personer og etter type', () => {
    const vis = new Set(['a', 'b'])
    expect(isEdgeVisible({ type: 'FRIEND', until: null }, vis, 'a', 'c', DEFAULT_FILTER)).toBe(false)
    expect(isEdgeVisible({ type: 'ROMANTIC', until: null }, vis, 'a', 'b', { ...DEFAULT_FILTER, hideRomanticEdges: true })).toBe(false)
    expect(isEdgeVisible({ type: 'FRIEND', until: new Date() }, vis, 'a', 'b', { ...DEFAULT_FILTER, showHistorical: false })).toBe(false)
    expect(isEdgeVisible({ type: 'FRIEND', until: null, derived: true }, vis, 'a', 'b', { ...DEFAULT_FILTER, showDerived: false })).toBe(false)
    expect(isEdgeVisible({ type: 'FRIEND', until: null }, vis, 'a', 'b', DEFAULT_FILTER)).toBe(true)
  })
  it('normalize dropper ukjente tagger og rart innhold', () => {
    expect(normalize({ hiddenTags: ['slettet', 'jobb'], showUntagged: 'ja' }, ['jobb'])).toEqual({
      ...DEFAULT_FILTER,
      hiddenTags: ['jobb'],
    })
    expect(normalize(null, [])).toEqual(DEFAULT_FILTER)
  })
  it('teller aktive filtre', () => {
    expect(activeCount(DEFAULT_FILTER)).toBe(0)
    expect(activeCount({ ...DEFAULT_FILTER, hiddenTags: ['x', 'y'], hideRomanticEdges: true })).toBe(3)
  })
})
