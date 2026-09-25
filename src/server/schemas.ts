import { z } from 'zod'
import { TAG_COLORS } from '@/lib/palette'

// Alt som kommer inn i en server action, valideres her. Skjemaene er rene
// og testes direkte; handlingene bare kaller safeParse.

const RELATIONSHIP_TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const
const LOG_TYPES = ['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER'] as const
const PHASES = ['FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER', 'ENDED'] as const

const id = z.string().min(1).max(64)

/** YYYY-MM-DD som faktisk finnes i kalenderen (ikke 31. februar). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  })

const cadenceWeeks = z.number().int().min(1).max(52).nullable()

export const tagName = z.string().trim().min(1).max(40)
export const tagColor = z.enum(TAG_COLORS)
export const tagInput = z.object({ name: tagName, color: tagColor })

export const personInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(RELATIONSHIP_TYPES),
  cadenceWeeks: cadenceWeeks.optional(),
  notes: z.string().max(10_000).optional(),
  birthday: isoDate.nullable().optional(),
  tagIds: z.array(id).max(50).optional(),
  primaryTagId: id.nullable().optional(),
})

export const personPatch = personInput.partial()

export const relationshipInput = z
  .object({
    fromPersonId: id,
    toPersonId: id,
    type: z.enum(RELATIONSHIP_TYPES),
    label: z.string().trim().max(60).nullable().optional(),
    since: isoDate.nullable().optional(),
    until: isoDate.nullable().optional(),
  })
  .refine((r) => r.fromPersonId !== r.toPersonId, { path: ['toPersonId'] })
  .refine((r) => !r.since || !r.until || r.since <= r.until, { path: ['until'] })

export const logInput = z.object({
  personIds: z.array(id).min(1).max(50),
  date: isoDate,
  type: z.enum(LOG_TYPES).nullable().optional(),
  body: z.string().max(20_000).optional(),
})

export const threadCloseInput = z.object({
  threadId: id,
  resolution: z.string().trim().max(500).optional(),
})

export const phaseInput = z.object({
  personId: id,
  phase: z.enum(PHASES),
  at: isoDate,
})

export type PersonInput = z.infer<typeof personInput>
export type PersonPatch = z.infer<typeof personPatch>
export type RelationshipInput = z.infer<typeof relationshipInput>
export type LogInput = z.infer<typeof logInput>
export type ThreadCloseInput = z.infer<typeof threadCloseInput>
export type TagInput = z.infer<typeof tagInput>
export type PhaseInput = z.infer<typeof phaseInput>
