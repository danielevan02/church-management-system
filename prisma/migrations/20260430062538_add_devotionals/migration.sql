-- CreateTable
CREATE TABLE "devotionals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "verseRef" TEXT,
    "verseText" TEXT,
    "body" TEXT NOT NULL,
    "authorName" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "devotionals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devotionals_publishedAt_idx" ON "devotionals"("publishedAt");

-- AddForeignKey
ALTER TABLE "devotionals" ADD CONSTRAINT "devotionals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
