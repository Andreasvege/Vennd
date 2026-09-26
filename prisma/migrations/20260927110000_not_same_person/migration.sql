-- CreateTable
CREATE TABLE "NotSamePerson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,

    CONSTRAINT "NotSamePerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotSamePerson_userId_aId_bId_key" ON "NotSamePerson"("userId", "aId", "bId");

-- AddForeignKey
ALTER TABLE "NotSamePerson" ADD CONSTRAINT "NotSamePerson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotSamePerson" ADD CONSTRAINT "NotSamePerson_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotSamePerson" ADD CONSTRAINT "NotSamePerson_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
