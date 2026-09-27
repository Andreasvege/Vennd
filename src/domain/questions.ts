// Spørsmålskort: spørsmål som henter folk ut av hukommelsen, i stedet for
// fra en fil. Hvert svar gir personer, og ofte et miljø, en nærhet eller
// en påminnelse på kjøpet. Teksten står i i18n (t.questions.<id>).

import type { RelationshipType } from '@/types'

export type QuestionEffect = {
  /** Et miljø de får, med et navn du kan endre (f.eks. «Kollektivet»). */
  group?: boolean
  /** De kjenner hverandre: koble alle du nevner, med hverandre. */
  connectAll?: RelationshipType
  /** Hva nye personer er for deg. */
  type?: RelationshipType
  /** Hvor ofte du vil holde kontakten: settes om det er tettere enn i dag. */
  cadenceWeeks?: number
  /** En påminnelse om å ta kontakt, med dato i dag. */
  reachOut?: boolean
}

export type Question = { id: QuestionId; effect: QuestionEffect }

export const QUESTION_IDS = [
  'goodNews',
  'missed',
  'livedWith',
  'school',
  'family',
  'work',
  'hobby',
  'neighbours',
] as const
export type QuestionId = (typeof QUESTION_IDS)[number]

export const QUESTIONS: Question[] = [
  { id: 'goodNews', effect: { type: 'FRIEND', cadenceWeeks: 2 } },
  { id: 'missed', effect: { type: 'FRIEND', reachOut: true } },
  { id: 'livedWith', effect: { group: true, connectAll: 'FRIEND', type: 'FRIEND' } },
  { id: 'school', effect: { group: true, connectAll: 'FRIEND', type: 'FRIEND' } },
  { id: 'family', effect: { type: 'FAMILY', cadenceWeeks: 4, connectAll: 'FAMILY' } },
  { id: 'work', effect: { group: true, connectAll: 'COLLEAGUE', type: 'COLLEAGUE' } },
  { id: 'hobby', effect: { group: true, connectAll: 'FRIEND', type: 'FRIEND' } },
  { id: 'neighbours', effect: { type: 'ACQUAINTANCE' } },
]

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id)

/** Ny kadens: bare tettere enn den du har (null = aldri påminn, altså løsest). */
export function tighterCadence(current: number | null, wanted: number | undefined): number | null | undefined {
  if (wanted === undefined) return undefined
  if (current !== null && current <= wanted) return undefined
  return wanted
}
