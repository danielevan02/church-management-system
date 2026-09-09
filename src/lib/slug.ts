import { prisma } from "@/lib/prisma";

/** Keeps a slug short enough to stay readable in a search result. */
const MAX_SLUG_LENGTH = 60;

/** Used when a title contains nothing sluggable — e.g. only punctuation. */
const FALLBACK_SLUG = "renungan";

/**
 * Turn a title into a URL segment.
 *
 * Combining marks are stripped via NFD rather than mapped through a
 * transliteration table: Indonesian is plain ASCII, and the handful of
 * borrowed words that carry an accent (`doa novéna`) want the base letter, not
 * a dropped character or a `%C3%A9` in the URL.
 */
export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return base || FALLBACK_SLUG;
}

/**
 * A slug for a new devotional that is not already taken.
 *
 * Collisions are real here rather than theoretical: churches publish
 * "Renungan Natal" every December, and the second one must not 404 or
 * overwrite the first. Duplicates get `-2`, `-3`, which is what a reader
 * expects to see and what every CMS does.
 *
 * The `@unique` index is still the actual guarantee — two admins saving at the
 * same instant can both pass this check — so callers must be prepared for a
 * P2002 and retry. This narrows the window; it does not replace the
 * constraint.
 */
export async function uniqueDevotionalSlug(title: string): Promise<string> {
  const base = slugify(title);

  // One query instead of N: fetch everything already sharing the stem.
  const taken = new Set(
    (
      await prisma.devotional.findMany({
        where: { slug: { startsWith: base } },
        select: { slug: true },
      })
    ).map((d) => d.slug),
  );

  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  // A thousand identically-titled devotionals is not a real scenario, but
  // returning a duplicate would be a crash, so fall back to something unique.
  return `${base}-${Date.now().toString(36)}`;
}
