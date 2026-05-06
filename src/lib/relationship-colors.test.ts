import { describe, it, expect } from 'vitest'
import { getRelationshipColor, RELATIONSHIP_COLORS } from './relationship-colors'

describe('getRelationshipColor', () => {
  it('returns correct color for FRIEND', () => {
    expect(getRelationshipColor('FRIEND')).toBe('#6c63ff')
  })

  it('returns correct color for FAMILY', () => {
    expect(getRelationshipColor('FAMILY')).toBe('#ef5350')
  })

  it('returns correct color for PARTNER', () => {
    expect(getRelationshipColor('PARTNER')).toBe('#ff6584')
  })

  it('covers all relationship types', () => {
    const types = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'PARTNER', 'ACQUAINTANCE', 'OTHER'] as const
    types.forEach((type) => {
      expect(RELATIONSHIP_COLORS[type]).toBeTruthy()
    })
  })
})
