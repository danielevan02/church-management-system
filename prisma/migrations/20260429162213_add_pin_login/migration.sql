-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pinHash" TEXT;

-- CreateTable
CREATE TABLE "pin_attempts" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pin_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pin_attempts_phone_createdAt_idx" ON "pin_attempts"("phone", "createdAt");
