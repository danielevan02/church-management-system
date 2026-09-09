-- Public, SEO-addressable URLs for devotionals.
--
-- Three statements in one migration, in this order, because the column is
-- NOT NULL: add it nullable, fill every existing row, then tighten. Adding it
-- as NOT NULL up front would fail on any database that already has
-- devotionals in it.

-- 1. Add nullable.
ALTER TABLE "devotionals" ADD COLUMN "slug" TEXT;

-- 2. Backfill from the title.
--
--    The expression mirrors `slugify()` in src/lib/slug.ts: lower-case,
--    every run of non-alphanumerics collapsed to a single hyphen, hyphens
--    trimmed from both ends, truncated to 60 characters and then re-trimmed
--    in case the cut landed on a hyphen.
--
--    Titles that reduce to nothing (punctuation only) fall back to
--    'renungan'. Duplicate stems — a church publishes "Renungan Natal" most
--    Decembers — are numbered -2, -3 by publication order, which is the same
--    scheme `uniqueDevotionalSlug()` applies to new rows, so the two cannot
--    disagree about what the next free slug is.
WITH base AS (
  SELECT
    "id",
    "publishedAt",
    COALESCE(
      NULLIF(
        rtrim(
          left(
            trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')),
            60
          ),
          '-'
        ),
        ''
      ),
      'renungan'
    ) AS stem
  FROM "devotionals"
),
numbered AS (
  SELECT
    "id",
    stem,
    row_number() OVER (PARTITION BY stem ORDER BY "publishedAt", "id") AS rn
  FROM base
)
UPDATE "devotionals" d
SET "slug" = CASE WHEN n.rn = 1 THEN n.stem ELSE n.stem || '-' || n.rn END
FROM numbered n
WHERE d."id" = n."id";

-- 3. Tighten. The unique index is the real guarantee that two devotionals can
--    never claim the same public URL; the application-level check in
--    uniqueDevotionalSlug() only narrows the race window.
ALTER TABLE "devotionals" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "devotionals_slug_key" ON "devotionals"("slug");
