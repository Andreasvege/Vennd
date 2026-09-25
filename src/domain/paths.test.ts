import { describe, it, expect } from 'vitest'
import { shortestPath, newProximities } from './paths'

describe('shortestPath', () => {
  const edges: [string, string][] = [
    ['hanna', 'jonas'],
    ['jonas', 'ingrid'],
    ['ingrid', 'martin'],
  ]
  it('finner korteste vei i begge retninger', () => {
    expect(shortestPath(edges, 'hanna', 'ingrid')).toEqual(['hanna', 'jonas', 'ingrid'])
    expect(shortestPath(edges, 'martin', 'hanna')).toEqual(['martin', 'ingrid', 'jonas', 'hanna'])
  })
  it('gir null når det ikke finnes vei, eller den er for lang', () => {
    expect(shortestPath(edges, 'hanna', 'ola')).toBeNull()
    expect(shortestPath(edges, 'hanna', 'martin', 2)).toBeNull()
  })
  it('velger den korte veien når det finnes flere', () => {
    const more: [string, string][] = [...edges, ['hanna', 'martin']]
    expect(shortestPath(more, 'hanna', 'martin')).toEqual(['hanna', 'martin'])
  })
})

describe('newProximities', () => {
  it('melder par som ble nærmere, når minst én er interessant', () => {
    const before: [string, string][] = [['jonas', 'ingrid']]
    const after: [string, string][] = [...before, ['hanna', 'jonas']]
    expect(newProximities(before, after, new Set(['hanna']))).toEqual([
      { a: 'hanna', b: 'ingrid', path: ['hanna', 'jonas', 'ingrid'] },
    ])
  })
  it('er stille når ingen interessante er involvert', () => {
    const before: [string, string][] = [['jonas', 'ingrid']]
    expect(newProximities(before, [...before, ['ola', 'jonas']], new Set(['hanna']))).toEqual([])
  })
  it('melder ikke direkte naboer (det vet du allerede)', () => {
    expect(newProximities([], [['hanna', 'jonas']], new Set(['hanna']))).toEqual([])
  })
  it('melder ikke par som var like nære fra før', () => {
    const before: [string, string][] = [['hanna', 'ola'], ['ola', 'ingrid']]
    const after: [string, string][] = [...before, ['hanna', 'jonas'], ['jonas', 'ingrid']]
    expect(newProximities(before, after, new Set(['hanna'])).map((p) => p.b)).not.toContain('ingrid')
  })
})
