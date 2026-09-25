import type { RelationshipType } from '@/types'

// Fargeblyantene. En farge lagres som nøkkel, aldri som hex, så paletten
// kan justeres (og ha egne mørk-varianter) uten å røre dataene.
export const TAG_COLORS = ['sage', 'ochre', 'slate', 'plum', 'rose', 'teal', 'clay', 'stone'] as const
export type TagColor = (typeof TAG_COLORS)[number]

export const tagFill = (c: TagColor) => `var(--tag-${c}-fill)`
export const tagStroke = (c: TagColor) => `var(--tag-${c}-stroke)`

// Midlertidig fargekilde til taggene kommer i delprosjekt 1: da tar
// hovedtaggen over, og dette blir bare reserven for personer uten tagg.
export const TYPE_TINT: Record<RelationshipType, TagColor> = {
  FRIEND: 'ochre',
  FAMILY: 'slate',
  COLLEAGUE: 'teal',
  PARTNER: 'rose',
  ACQUAINTANCE: 'stone',
  OTHER: 'clay',
}
