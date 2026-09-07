-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "cadenceWeeks" INTEGER DEFAULT 4,
ADD COLUMN     "snoozedUntil" TIMESTAMP(3),
ADD COLUMN     "type" "RelationshipType" NOT NULL DEFAULT 'FRIEND';

-- Auto-påminnelser beregnes nå ved lesing (src/lib/reminders.ts), ikke lagres.
-- De lagrede radene er ugyldige: dismissed virket aldri, fordi hver sidelast
-- slettet de aktive og gjenskapte dem, mens de avviste ble liggende igjen.
-- MANUAL-påminnelser beholdes.
DELETE FROM "Reminder" WHERE "type" = 'AUTO';
