import { z } from 'zod'
import { TAG_COLORS } from '@/lib/palette'
import { MAP_MODES } from '@/domain/mapMode'
import { LOG_TYPES } from '@/domain/logTypes'
import { CLOSENESS } from '@/domain/sorting'

// Alt som kommer inn i en server action, valideres her. Skjemaene er rene
// og testes direkte; handlingene bare kaller safeParse.

const RELATIONSHIP_TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const
const PHASES = ['FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER', 'ENDED'] as const

export const id = z.string().min(1).max(64)

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

export const logInput = z
  .object({
    personIds: z.array(id).min(1).max(50),
    date: isoDate,
    type: z.enum(LOG_TYPES).nullable().optional(),
    body: z.string().max(20_000).optional(),
    // Planen denne loggen følger opp («Hvordan gikk det?»).
    planId: id.optional(),
    // Tråder denne loggen følger opp («fikk jobben»)…
    closeThreads: z
      .array(z.object({ id, resolution: z.string().trim().max(500).optional() }))
      .max(50)
      .optional(),
    // …og nye den åpner («spør om første uka»).
    newThreads: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(200),
          personIds: z.array(id).min(1).max(50),
          dueDate: isoDate.nullable().optional(),
        }),
      )
      .max(20)
      .optional(),
  })
  // En ny tråd kan bare handle om noen som var med: den oppstod i samtalen.
  .refine((l) => (l.newThreads ?? []).every((th) => th.personIds.every((p) => l.personIds.includes(p))), {
    path: ['newThreads'],
  })

export const threadCloseInput = z.object({
  threadId: id,
  resolution: z.string().trim().max(500).optional(),
})

export const factInput = z.object({
  label: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(200),
})

export const relationshipPatch = z
  .object({
    type: z.enum(RELATIONSHIP_TYPES),
    label: z.string().trim().max(60).nullable(),
    since: isoDate.nullable(),
    until: isoDate.nullable(),
  })
  .partial()
  .refine((r) => !r.since || !r.until || r.since <= r.until, { path: ['until'] })

export const planInput = z.object({
  title: z.string().trim().min(1).max(120),
  personIds: z.array(id).min(1).max(50),
  date: isoDate,
  // Regnet ut i nettleseren (lokal tid → ISO), fordi serveren ikke kjenner
  // din tidssone. Uten klokkeslett: bare datoen.
  at: z.string().datetime().nullable().optional(),
  type: z.enum(LOG_TYPES).nullable().optional(),
})

export const mapViewInput = z.object({
  name: z.string().trim().min(1).max(40),
  mode: z.enum(MAP_MODES),
  filter: z.object({
    hiddenTags: z.array(id).max(200),
    showUntagged: z.boolean(),
    hideRomanticEdges: z.boolean(),
    showHistorical: z.boolean(),
    showDerived: z.boolean(),
  }),
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
export type FactInput = z.infer<typeof factInput>
export type MapViewInput = z.infer<typeof mapViewInput>
export type PlanInput = z.infer<typeof planInput>
export type RelationshipPatch = z.infer<typeof relationshipPatch>

// Import: radene brukeren valgte i forhåndsvisningen. Filen er lest i
// nettleseren; serveren sjekker duplikater på nytt før noe lagres.
export const IMPORT_MAX = 1000

export const contactImport = z.object({
  contacts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        birthday: isoDate.nullable(),
        phone: z.string().trim().max(200).nullable(),
        email: z.string().trim().max(200).nullable(),
        note: z.string().max(10_000).nullable(),
      }),
    )
    .min(1)
    .max(IMPORT_MAX),
  tagIds: z.array(id).max(50),
  remind: z.boolean(),
})

export const eventImport = z.object({
  events: z
    .array(
      z.object({
        kind: z.enum(['log', 'plan']),
        title: z.string().trim().max(500),
        description: z.string().max(10_000).nullable(),
        personIds: z.array(id).min(1).max(50),
        // Dagen i din kalender, og tidspunktet (ISO) når hendelsen har klokkeslett.
        date: isoDate,
        at: z.string().datetime().nullable(),
      }),
    )
    .min(1)
    .max(IMPORT_MAX),
})

export type ContactImport = z.infer<typeof contactImport>
export type EventImport = z.infer<typeof eventImport>

// Innholdet i et forslag fra Claude, per type. Lagres som Json og leses
// alltid gjennom disse, så en gammel eller ødelagt rad aldri når Prisma.
export const suggestionPayload = {
  THREAD: z.object({ title: z.string().trim().min(1).max(120), personIds: z.array(id).min(1).max(50), dueDate: isoDate.nullable() }),
  FACT: z.object({ personId: id, label: factInput.shape.label, value: factInput.shape.value }),
  PARTICIPANT: z.object({ personId: id }),
  PERSON: z.object({ name: z.string().trim().min(1).max(120) }),
} as const

// Å rette en logg i ettertid: tekst, dag, type og hvem som var med.
// Trådene den lukket eller åpnet står urørt.
export const logEdit = z.object({
  personIds: z.array(id).min(1).max(50),
  date: isoDate,
  type: z.enum(LOG_TYPES).nullable(),
  body: z.string().max(20_000),
})
export type LogEdit = z.infer<typeof logEdit>

// Sortering: kortstokken, miljø for miljø og Venter-bunken.
export const sortPersonInput = z.object({
  personId: id,
  closeness: z.enum(CLOSENESS),
  tagIds: z.array(id).max(20),
  knows: z.array(id).max(50),
})
export const assignGroupInput = z.object({
  tagId: id,
  personIds: z.array(id).max(500),
  connect: z.enum(['all', 'pairs', 'none']),
  pairs: z.array(z.tuple([id, id])).max(5000).optional(),
})
export const personIdList = z.array(id).min(1).max(1000)
export type SortPersonInput = z.infer<typeof sortPersonInput>
export type AssignGroupInput = z.infer<typeof assignGroupInput>

// Forslag til forbindelser: et par av personer.
export const linkPair = z.tuple([id, id]).refine(([a, b]) => a !== b)
export const linkPairs = z.array(linkPair).min(1).max(500)
