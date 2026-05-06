import type { RelationshipType } from '@prisma/client'

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  FRIEND: '#6c63ff',
  FAMILY: '#ef5350',
  COLLEAGUE: '#29b6f6',
  PARTNER: '#ff6584',
  ACQUAINTANCE: '#888888',
  OTHER: '#f9a825',
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  FRIEND: 'Venn',
  FAMILY: 'Familie',
  COLLEAGUE: 'Kollega',
  PARTNER: 'Partner',
  ACQUAINTANCE: 'Bekjent',
  OTHER: 'Annet',
}

export function getRelationshipColor(type: RelationshipType): string {
  return RELATIONSHIP_COLORS[type]
}
