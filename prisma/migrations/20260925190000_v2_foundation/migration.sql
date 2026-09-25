-- V2-datamodellen. Prisma sin genererte SQL ville mistet data (den
-- konverterte RelationshipType med en cast som feiler på PARTNER, og droppet
-- LogEntry.personId, notes og Reminder før innholdet var flyttet). Denne er
-- skrevet om så alt flyttes før noe slettes. Tabellene og indeksene nederst
-- er Prisma sine, uendret.

-- 1. Enums. PARTNER heter nå ROMANTIC: samme verdi, nytt navn — ingen rader
--    røres, og ingen cast som kan feile.
ALTER TYPE "RelationshipType" RENAME VALUE 'PARTNER' TO 'ROMANTIC';
ALTER TYPE "LogEntryType" ADD VALUE 'DATE';
CREATE TYPE "ThreadStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "RomanticPhase" AS ENUM ('FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER', 'ENDED');

-- 2. Nye kolonner.
ALTER TABLE "Person"
  ADD COLUMN "photoUrl" TEXT,
  ADD COLUMN "primaryTagId" TEXT;
ALTER TABLE "Relationship"
  ADD COLUMN "label" TEXT,
  ADD COLUMN "since" TIMESTAMP(3),
  ADD COLUMN "until" TIMESTAMP(3);
ALTER TABLE "LogEntry" RENAME COLUMN "notes" TO "body";
ALTER TABLE "LogEntry" ALTER COLUMN "type" DROP NOT NULL;

-- 3. Nye tabeller, indekser og fremmednøkler (Prisma sin SQL).
-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonTag" (
    "personId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PersonTag_pkey" PRIMARY KEY ("personId","tagId")
);

-- CreateTable
CREATE TABLE "LogParticipant" (
    "logEntryId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "LogParticipant_pkey" PRIMARY KEY ("logEntryId","personId")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ThreadStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "dueDate" TIMESTAMP(3),
    "openedById" TEXT,
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadPerson" (
    "threadId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "ThreadPerson_pkey" PRIMARY KEY ("threadId","personId")
);

-- CreateTable
CREATE TABLE "Fact" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RomanticPhaseEntry" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "phase" "RomanticPhase" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RomanticPhaseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "PersonTag_tagId_idx" ON "PersonTag"("tagId");

-- CreateIndex
CREATE INDEX "LogParticipant_personId_idx" ON "LogParticipant"("personId");

-- CreateIndex
CREATE INDEX "Thread_userId_status_idx" ON "Thread"("userId", "status");

-- CreateIndex
CREATE INDEX "ThreadPerson_personId_idx" ON "ThreadPerson"("personId");

-- CreateIndex
CREATE INDEX "Fact_personId_idx" ON "Fact"("personId");

-- CreateIndex
CREATE INDEX "RomanticPhaseEntry_personId_at_idx" ON "RomanticPhaseEntry"("personId", "at");

-- CreateIndex
CREATE INDEX "LogEntry_userId_date_idx" ON "LogEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_primaryTagId_fkey" FOREIGN KEY ("primaryTagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTag" ADD CONSTRAINT "PersonTag_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTag" ADD CONSTRAINT "PersonTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogParticipant" ADD CONSTRAINT "LogParticipant_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "LogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogParticipant" ADD CONSTRAINT "LogParticipant_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "LogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "LogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadPerson" ADD CONSTRAINT "ThreadPerson_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadPerson" ADD CONSTRAINT "ThreadPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RomanticPhaseEntry" ADD CONSTRAINT "RomanticPhaseEntry_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Tagger er unike per bruker uten hensyn til store og små bokstaver.
CREATE UNIQUE INDEX "Tag_userId_lower_name_key" ON "Tag" ("userId", lower("name"));

-- 5. Data. Én deltaker per eksisterende logg.
INSERT INTO "LogParticipant" ("logEntryId", "personId")
SELECT "id", "personId" FROM "LogEntry";

-- Manuelle påminnelser blir tråder; avviste blir lukkede. (AUTO-rader ble
-- slettet i forrige migrering og beregnes ved lesing.)
INSERT INTO "Thread" ("id", "userId", "title", "status", "dueDate", "createdAt", "closedAt")
SELECT "id", "userId", COALESCE(NULLIF(btrim("message"), ''), 'Påminnelse'),
       CASE WHEN "dismissed" THEN 'CLOSED'::"ThreadStatus" ELSE 'OPEN'::"ThreadStatus" END,
       "dueDate", "createdAt", CASE WHEN "dismissed" THEN "createdAt" END
FROM "Reminder" WHERE "type" = 'MANUAL';

INSERT INTO "ThreadPerson" ("threadId", "personId")
SELECT "id", "personId" FROM "Reminder" WHERE "type" = 'MANUAL';

-- 6. Rydd: det som nå er flyttet eller utledes i presentasjonslaget.
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_personId_fkey";
ALTER TABLE "LogEntry" DROP COLUMN "personId";
ALTER TABLE "Person" DROP COLUMN "color";
ALTER TABLE "Relationship" DROP COLUMN "color";
DROP TABLE "Reminder";
DROP TYPE "ReminderType";
