-- Migrate existing SUPER_ADMIN users down to ADMIN before reshaping the enum.
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'SUPER_ADMIN';

-- Recreate Role enum without SUPER_ADMIN.
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'LEADER', 'MEMBER');

ALTER TABLE "users"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'MEMBER';

DROP TYPE "Role_old";
