import type { PersonWithLastContact } from '@/types'

export const WEEKS_THRESHOLD = 3

export type AutoReminderInput = {
  personId: string
  userId: string
  message: string
  type: 'AUTO'
}

export function generateAutoReminders(
  persons: PersonWithLastContact[],
  now: Date = new Date()
): AutoReminderInput[] {
  return persons
    .filter((person) => {
      if (!person.lastContactDate) return true
      const diffMs = now.getTime() - person.lastContactDate.getTime()
      const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7)
      return diffWeeks >= WEEKS_THRESHOLD
    })
    .map((person) => {
      const weeksAgo = person.lastContactDate
        ? Math.floor(
            (now.getTime() - person.lastContactDate.getTime()) /
              (1000 * 60 * 60 * 24 * 7)
          )
        : null

      const message = weeksAgo
        ? `Du har ikke hatt kontakt med ${person.name} på ${weeksAgo} uker`
        : `Du har aldri logget kontakt med ${person.name}`

      return {
        personId: person.id,
        userId: person.userId,
        message,
        type: 'AUTO' as const,
      }
    })
}
