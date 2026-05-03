/*
  Warnings:

  - Added the required column `receivedAt` to the `giving_entries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "giving_entries" DROP CONSTRAINT "giving_entries_serviceId_fkey";

-- AlterTable
ALTER TABLE "giving_entries" ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "giving_entries_receivedAt_idx" ON "giving_entries"("receivedAt");

-- AddForeignKey
ALTER TABLE "giving_entries" ADD CONSTRAINT "giving_entries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
