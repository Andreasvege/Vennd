import type { $Enums } from '@prisma/client'

export type RelationshipType = $Enums.RelationshipType
export type LogEntryType = $Enums.LogEntryType
export type RomanticPhase = $Enums.RomanticPhase

// Inndata til kadens-påminnelsene. Settes sammen i spørringen fra personen
// og siste logg de var med i — beregningen selv rører aldri databasen.
export type PersonWithCadence = {
  id: string
  name: string
  userId: string
  cadenceWeeks: number | null
  snoozedUntil: Date | null
  lastContactDate: Date | null
}

// En kadens-påminnelse er utledet, ikke lagret. id-en er syntetisk.
export type ComputedReminder = {
  id: string
  personId: string
  personName: string
  type: 'AUTO'
  message: string
  weeksSinceContact: number | null
}

// «Meg»-noden bygges fra sesjonen, ikke fra databasen.
export type MeNodeData = {
  name: string
  image: string | null
}
