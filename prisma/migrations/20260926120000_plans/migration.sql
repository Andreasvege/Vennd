-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "hasTime" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "type" "LogEntryType",
    "status" "PlanStatus" NOT NULL DEFAULT 'PLANNED',
    "logEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPerson" (
    "planId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "PlanPerson_pkey" PRIMARY KEY ("planId","personId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_logEntryId_key" ON "Plan"("logEntryId");

-- CreateIndex
CREATE INDEX "Plan_userId_status_at_idx" ON "Plan"("userId", "status", "at");

-- CreateIndex
CREATE INDEX "PlanPerson_personId_idx" ON "PlanPerson"("personId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "LogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPerson" ADD CONSTRAINT "PlanPerson_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPerson" ADD CONSTRAINT "PlanPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
