-- Switch staff/admin login from email to username.
-- Backfill the new column from the email's local-part for any existing
-- rows so admins can keep logging in (admin@church → "admin"). PIN-only
-- members never had email anyway and stay with username = NULL.

-- 1. Add nullable username column.
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- 2. Backfill from email's local-part for rows that have email. Lower-case
--    so future logins are case-insensitive-ish (auth code lower-cases too).
UPDATE "users"
SET "username" = lower(split_part("email", '@', 1))
WHERE "email" IS NOT NULL;

-- 3. Add unique index on username.
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- 4. Drop the email column + its index, plus the unused emailVerified.
DROP INDEX "users_email_key";
ALTER TABLE "users" DROP COLUMN "email";
ALTER TABLE "users" DROP COLUMN "emailVerified";
