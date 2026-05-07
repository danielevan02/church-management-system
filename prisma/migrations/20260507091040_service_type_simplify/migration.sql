-- Simplify ServiceType enum:
--   - merge SUNDAY_MORNING + SUNDAY_EVENING into SUNDAY_SERVICE
--   - rename MIDWEEK to PRAYER_MEETING
--   - keep YOUTH, CHILDREN, SPECIAL, OTHER
-- Postgres doesn't allow dropping enum values in place, so swap to a new enum type.

CREATE TYPE "ServiceType_new" AS ENUM (
  'SUNDAY_SERVICE',
  'YOUTH',
  'CHILDREN',
  'PRAYER_MEETING',
  'SPECIAL',
  'OTHER'
);

ALTER TABLE "services"
  ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "services"
  ALTER COLUMN "type" TYPE "ServiceType_new"
  USING (
    CASE "type"::text
      WHEN 'SUNDAY_MORNING' THEN 'SUNDAY_SERVICE'::"ServiceType_new"
      WHEN 'SUNDAY_EVENING' THEN 'SUNDAY_SERVICE'::"ServiceType_new"
      WHEN 'MIDWEEK' THEN 'PRAYER_MEETING'::"ServiceType_new"
      ELSE "type"::text::"ServiceType_new"
    END
  );

DROP TYPE "ServiceType";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
