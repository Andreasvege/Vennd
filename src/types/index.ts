import type { Person, Relationship, LogEntry, Reminder, RelationshipType, LogEntryType, ReminderType } from '@prisma/client'

// Re-export Prisma types for convenience
export type { Person, Relationship, LogEntry, Reminder, RelationshipType, LogEntryType, ReminderType }

// Person with last contact date (used for reminder logic)
export type PersonWithLastContact = {
  id: string
  name: string
  userId: string
  lastContactDate: Date | null
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
