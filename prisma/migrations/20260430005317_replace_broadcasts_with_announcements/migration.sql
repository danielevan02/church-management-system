-- Drop deprecated broadcast/communications tables and types.
DROP TABLE IF EXISTS "message_deliveries";
DROP TABLE IF EXISTS "broadcast_campaigns";
DROP TABLE IF EXISTS "message_templates";
DROP TYPE IF EXISTS "MessageStatus";
DROP TYPE IF EXISTS "MessageChannel";

-- Drop the now-unused per-member broadcast opt-out flag.
ALTER TABLE "members" DROP COLUMN IF EXISTS "excludeFromBroadcasts";

-- Create the in-app Announcement table.
CREATE TABLE "announcements" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "deletedAt"   TIMESTAMP(3),

  CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "announcements_publishedAt_idx" ON "announcements" ("publishedAt");

ALTER TABLE "announcements"
  ADD CONSTRAINT "announcements_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
