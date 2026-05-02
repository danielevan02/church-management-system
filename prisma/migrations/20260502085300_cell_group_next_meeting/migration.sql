/*
  Warnings:

  - You are about to drop the column `meetingDay` on the `cell_groups` table. All the data in the column will be lost.
  - You are about to drop the column `meetingLocation` on the `cell_groups` table. All the data in the column will be lost.
  - You are about to drop the column `meetingTime` on the `cell_groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cell_groups" DROP COLUMN "meetingDay",
DROP COLUMN "meetingLocation",
DROP COLUMN "meetingTime",
ADD COLUMN     "nextMeetingAt" TIMESTAMP(3),
ADD COLUMN     "nextMeetingLocation" TEXT,
ADD COLUMN     "nextMeetingNotes" TEXT;
