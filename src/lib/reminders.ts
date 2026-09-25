import { t } from '@/i18n'
import type { PersonWithCadence, ComputedReminder } from '@/types'

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7

function weeksBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_WEEK)
}

/**
 * Utleder auto-påminnelser fra siste kontakt og personens kadens.
 *
 * Disse lagres bevisst ikke. Den forrige løsningen skrev dem til Reminder-
 * tabellen og slettet/gjenskapte dem ved hver sidelast, noe som gjorde det
 * umulig å avvise én: den avviste raden ble liggende igjen mens en fersk
 * kopi dukket opp med det samme. Beregning ved lesing fjerner hele den
 * klassen av problemer — utsettelse er nå én kolonne på Person.
 */
export function computeAutoReminders(
  persons: PersonWithCadence[],
  now: Date = new Date()
): ComputedReminder[] {
  return persons
    .filter((p) => {
      if (p.cadenceWeeks === null) return false
      if (p.snoozedUntil !== null && p.snoozedUntil.getTime() > now.getTime()) return false
      if (p.lastContactDate === null) return true
      return weeksBetween(p.lastContactDate, now) >= p.cadenceWeeks
    })
    .map((p) => {
      const weeks = p.lastContactDate === null ? null : weeksBetween(p.lastContactDate, now)
      return {
        id: `auto:${p.id}`,
        personId: p.id,
        personName: p.name,
        type: 'AUTO' as const,
        message:
          weeks === null ? t.reminders.neverContacted : t.reminders.weeksSince(weeks),
        weeksSinceContact: weeks,
      }
    })
    .sort((a, b) => {
      // Aldri kontaktet er mest forfalt av alt, og sorteres øverst.
      if (a.weeksSinceContact === null) return b.weeksSinceContact === null ? 0 : -1
      if (b.weeksSinceContact === null) return 1
      return b.weeksSinceContact - a.weeksSinceContact
    })
}
