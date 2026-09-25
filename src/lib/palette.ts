// Fargeblyantene. En farge lagres som nøkkel, aldri som hex, så paletten
// kan justeres (og ha egne mørk-varianter) uten å røre dataene.
export const TAG_COLORS = ['sage', 'ochre', 'slate', 'plum', 'rose', 'teal', 'clay', 'stone'] as const
export type TagColor = (typeof TAG_COLORS)[number]

export const tagFill = (c: TagColor) => `var(--tag-${c}-fill)`
export const tagStroke = (c: TagColor) => `var(--tag-${c}-stroke)`

export function isTagColor(value: string | null | undefined): value is TagColor {
  return (TAG_COLORS as readonly string[]).includes(value ?? '')
}

/** En persons farge: hovedtaggens, ellers nøytral stein. */
export function personTint(p: { primaryTag: { color: string } | null }): TagColor {
  return isTagColor(p.primaryTag?.color) ? p.primaryTag.color : 'stone'
}

/** Første farge som ikke er i bruk, så nye tagger skiller seg fra de gamle. */
export function nextTagColor(used: string[]): TagColor {
  return TAG_COLORS.find((c) => !used.includes(c)) ?? TAG_COLORS[used.length % TAG_COLORS.length]
}
