-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('OPEN', 'ACCEPTED', 'DISMISSED');

-- CreateTable
CREATE TABLE "LinkSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'OPEN',
    "assessed" BOOLEAN NOT NULL DEFAULT false,
    "keep" BOOLEAN NOT NULL DEFAULT true,
    "type" "RelationshipType",
    "label" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkSuggestion_userId_aId_bId_key" ON "LinkSuggestion"("userId", "aId", "bId");

-- AddForeignKey
ALTER TABLE "LinkSuggestion" ADD CONSTRAINT "LinkSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkSuggestion" ADD CONSTRAINT "LinkSuggestion_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkSuggestion" ADD CONSTRAINT "LinkSuggestion_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
