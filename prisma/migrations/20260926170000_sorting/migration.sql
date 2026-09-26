-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "sortedAt" TIMESTAMP(3);

-- Eksisterende personer som har en tagg, en relasjon eller en logg, er
-- allerede plassert. Resten (typisk en fersk import) blir usortert.
UPDATE "Person" p SET "sortedAt" = p."createdAt"
WHERE EXISTS (SELECT 1 FROM "PersonTag" t WHERE t."personId" = p."id")
   OR EXISTS (SELECT 1 FROM "Relationship" r WHERE r."fromPersonId" = p."id" OR r."toPersonId" = p."id")
   OR EXISTS (SELECT 1 FROM "LogParticipant" l WHERE l."personId" = p."id");
