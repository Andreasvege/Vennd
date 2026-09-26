-- CreateTable
CREATE TABLE "LinkInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "hubId" TEXT,
    "memberIds" JSONB NOT NULL,
    "type" "RelationshipType" NOT NULL,
    "label" TEXT,
    "groupName" TEXT,
    "status" "LinkStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkInsight_userId_status_idx" ON "LinkInsight"("userId", "status");

-- AddForeignKey
ALTER TABLE "LinkInsight" ADD CONSTRAINT "LinkInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
