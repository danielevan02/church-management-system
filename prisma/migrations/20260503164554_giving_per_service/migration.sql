/*
  Warnings:

  - You are about to drop the `giving_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "giving_records" DROP CONSTRAINT "giving_records_fundId_fkey";

-- DropForeignKey
ALTER TABLE "giving_records" DROP CONSTRAINT "giving_records_memberId_fkey";

-- DropTable
DROP TABLE "giving_records";

-- DropEnum
DROP TYPE "GivingMethod";

-- DropEnum
DROP TYPE "GivingStatus";

-- CreateTable
CREATE TABLE "giving_entries" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giving_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "giving_entries_serviceId_idx" ON "giving_entries"("serviceId");

-- CreateIndex
CREATE INDEX "giving_entries_fundId_idx" ON "giving_entries"("fundId");

-- AddForeignKey
ALTER TABLE "giving_entries" ADD CONSTRAINT "giving_entries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giving_entries" ADD CONSTRAINT "giving_entries_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
