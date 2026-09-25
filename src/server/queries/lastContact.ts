import 'server-only'
import { prisma } from '@/lib/prisma'

/**
 * Siste kontakt per person, regnet ut i databasen med én GROUP BY. Delt av
 * påminnelsene (kadens) og kartet (ferskhet), så de alltid er enige.
 */
export async function getLastContact(userId: string): Promise<Map<string, Date>> {
  const rows = await prisma.$queryRaw<{ personId: string; last: Date }[]>`
    SELECT lp."personId", max(le."date") AS "last"
    FROM "LogParticipant" lp
    JOIN "LogEntry" le ON le."id" = lp."logEntryId"
    WHERE le."userId" = ${userId}
    GROUP BY lp."personId"
  `
  return new Map(rows.map((r) => [r.personId, r.last]))
}
