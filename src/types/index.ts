import type { Person, Relationship, LogEntry, Reminder, $Enums } from '@prisma/client'

export type { Person, Relationship, LogEntry, Reminder }
export type RelationshipType = $Enums.RelationshipType
export type LogEntryType = $Enums.LogEntryType
export type ReminderType = $Enums.ReminderType

// Inndata til auto-påminnelsene. Settes sammen i API-laget fra Person pluss
// nyeste LogEntry — beregningen selv rører aldri databasen.
export type PersonWithCadence = {
  id: string
  name: string
  userId: string
  cadenceWeeks: number | null
  snoozedUntil: Date | null
  lastContactDate: Date | null
}

// En auto-påminnelse er utledet, ikke lagret. id-en er syntetisk og finnes
// ikke i Reminder-tabellen — den er kun en React-nøkkel.
export type ComputedReminder = {
  id: string
  personId: string
  personName: string
  type: 'AUTO'
  message: string
  weeksSinceContact: number | null
}

// Det API-et faktisk sender til klienten: beregnede AUTO-påminnelser og
// lagrede MANUAL-rader slått sammen til én liste.
export type ReminderResponse = {
  id: string
  personId: string
  personName: string
  type: ReminderType
  message: string
  dueDate: string | null
  weeksSinceContact: number | null
}

// «Meg»-noden bygges fra sesjonen, ikke fra databasen.
export type MeNodeData = {
  name: string
  image: string | null
  initials: string
}

// React Flow node data shape
export type PersonNodeData = {
  id: string
  name: string
  color: string
  initials: string
  onAddLog: (personId: string) => void
  onViewProfile: (personId: string) => void
}

// API response shape for graph data
export type GraphData = {
  persons: Person[]
  relationships: Relationship[]
}
