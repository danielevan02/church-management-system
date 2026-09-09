import { church } from "@/config/church";
import { listPublicDevotionalSlugs } from "@/server/queries/devotionals";

import type { MetadataRoute } from "next";

/**
 * The sitemap, which the site did not have at all.
 *
 * Every entry is listed once per locale with `alternates.languages`, rather
 * than as two unrelated URLs. That is what tells a crawler `/renungan` and
 * `/en/renungan` are the same document in two languages instead of duplicate
 * content competing with each other.
 *
 * Only publicly readable devotionals appear — `listPublicDevotionalSlugs`
 * applies the same published-and-not-deleted gate the pages do, so a withdrawn
 * devotional stops being advertised at the same moment it stops being
 * reachable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = church.siteUrl;
  const devotionals = await listPublicDevotionalSlugs();

  const entry = (
    path: string,
    lastModified: Date,
    changeFrequency: "daily" | "weekly" | "monthly",
    priority: number,
  ) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        id: `${base}${path}`,
        en: `${base}/en${path === "/" ? "" : path}`,
      },
    },
  });

  const now = new Date();
  const newest = devotionals[0]?.updatedAt ?? now;

  return [
    entry("/", now, "weekly", 1),
    ...(devotionals.length > 0
      ? [entry("/renungan", newest, "daily", 0.8)]
      : []),
    ...devotionals.map((d) =>
      entry(`/renungan/${d.slug}`, d.updatedAt, "monthly", 0.7),
    ),
    entry("/give", now, "monthly", 0.4),
  ];
}
