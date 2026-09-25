-- CreateEnum
CREATE TYPE "SuggestionKind" AS ENUM ('THREAD', 'FACT', 'PARTICIPANT', 'PERSON');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DISMISSED');

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "suggestedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "kind" "SuggestionKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Suggestion_userId_status_createdAt_idx" ON "Suggestion"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Suggestion_logEntryId_idx" ON "Suggestion"("logEntryId");

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "LogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
