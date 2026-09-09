import { hasVisitInfo } from "@/components/landing/landing-visit";
import { prisma } from "@/lib/prisma";

import type { PublicSections } from "@/config/public-nav";

/**
 * Which optional public sections exist right now, for pages that render the
 * shared header and footer without already having fetched the underlying
 * lists.
 *
 * The landing page does not use this — it derives the same three flags from
 * data it has already loaded, so paying for two extra counts there would be
 * waste. Everything else (the devotional archive, a devotional's own page)
 * has no reason to load events or devotionals except to decide whether to
 * show a nav entry, and two `count()`s is the cheapest way to ask.
 */
export async function getPublicSections(): Promise<PublicSections> {
  const [devotionals, events] = await Promise.all([
    prisma.devotional.count({
      where: { deletedAt: null, publishedAt: { lte: new Date() } },
    }),
    prisma.event.count({
      where: { deletedAt: null, isPublished: true, endsAt: { gte: new Date() } },
    }),
  ]);

  return {
    devotional: devotionals > 0,
    events: events > 0,
    visit: hasVisitInfo(),
  };
}
