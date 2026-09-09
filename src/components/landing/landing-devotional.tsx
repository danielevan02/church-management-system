import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { LandingEntry } from "@/components/landing/landing-entry";
import { LandingSection } from "@/components/landing/landing-section";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";

import type { DevotionalPublicItem } from "@/server/queries/devotionals";

/**
 * The latest devotionals, as an editorial list.
 *
 * Rows link straight to the reading. They used to point at sign-in, because
 * devotionals were member-only and there was no public route to send anyone
 * to — which meant the church's one body of original writing was invisible to
 * search engines and to every visitor who had not yet signed up. They are
 * public now; `/renungan/[slug]` is the destination.
 */
export async function LandingDevotional({
  devotionals,
  index,
}: {
  devotionals: DevotionalPublicItem[];
  index: string;
}) {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const df = dateFnsLocale(locale);

  return (
    <LandingSection
      id="renungan"
      index={index}
      label={t("nav.devotional")}
      title={t("devotional.title")}
      description={t("devotional.description")}
      aside={
        <Link
          href="/renungan"
          className="lp-action group inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
        >
          <span className="lp-link-on">{t("devotional.archiveCta")}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      }
    >
      <ul className="lp-reveal border-t border-lp-ink">
        {devotionals.map((devotional) => (
          <LandingEntry
            key={devotional.id}
            href={`/renungan/${devotional.slug}`}
            rail={
              <time
                dateTime={devotional.publishedAt.toISOString()}
                className="block"
              >
                <span className="lp-num-sm block text-lp-ink">
                  {formatJakarta(devotional.publishedAt, "d", df)}
                </span>
                <span className="lp-label mt-1.5 block text-lp-ink-faint">
                  {formatJakarta(devotional.publishedAt, "MMM yyyy", df)}
                </span>
              </time>
            }
            overline={devotional.verseRef ?? undefined}
            title={devotional.title}
            body={excerpt(devotional.body, 180)}
            meta={
              devotional.authorName
                ? t("devotional.byline", { author: devotional.authorName })
                : undefined
            }
            action={t("devotional.readMore")}
          />
        ))}
      </ul>
    </LandingSection>
  );
}
