import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { LandingEntry } from "@/components/landing/landing-entry";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { church } from "@/config/church";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { listPublicDevotionalsPage } from "@/server/queries/devotionals";
import { getPublicSections } from "@/server/queries/public-sections";

/**
 * Re-rendered hourly as a backstop. The mutations already call
 * `revalidatePath("/renungan")`, so a new devotional appears immediately; this
 * only covers a scheduled `publishedAt` falling due with nobody editing
 * anything.
 */
export const revalidate = 3600;

const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.devotional");
  const locale = await getLocale();
  const title = t("archiveTitle");
  const description = t("archiveDescription", { church: church.name });
  const path = locale === "id" ? "/renungan" : `/${locale}/renungan`;

  return {
    title,
    description,
    alternates: {
      canonical: `${church.siteUrl}${path}`,
      languages: {
        id: `${church.siteUrl}/renungan`,
        en: `${church.siteUrl}/en/renungan`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: church.name,
      url: `${church.siteUrl}${path}`,
      locale: locale === "id" ? "id_ID" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * The public devotional archive.
 *
 * Devotionals used to be member-only, which meant the church's one continuous
 * stream of original writing was invisible to search engines and to anyone who
 * had not signed in. Everything here is deliberately readable without an
 * account.
 */
export default async function DevotionalArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [t, locale, sections, result] = await Promise.all([
    getTranslations("landing"),
    getLocale(),
    getPublicSections(),
    listPublicDevotionalsPage({ page, pageSize: PAGE_SIZE }),
  ]);
  const df = dateFnsLocale(locale);

  return (
    <main className="flex min-h-dvh flex-col bg-lp-paper text-lp-ink selection:bg-lp-accent/15 selection:text-lp-ink">
      <LandingHeader sections={sections} />

      <section className="border-t border-lp-rule">
        <div className="mx-auto w-full max-w-320 px-6 py-20 sm:px-10 sm:py-28 lg:px-14 lg:py-32">
          <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <span className="lp-label text-lp-ink-faint">
                {t("nav.devotional")}
              </span>
            </div>
            <div className="lg:col-span-9">
              <h1 className="lp-display text-balance text-lp-ink">
                {t("devotional.archiveTitle")}
              </h1>
              <p className="lp-lead mt-7 max-w-xl text-pretty text-lp-ink-soft">
                {t("devotional.archiveDescription", { church: church.name })}
              </p>
            </div>
          </div>

          {result.items.length === 0 ? (
            <p className="lp-body mt-16 border-t border-lp-ink pt-8 text-lp-ink-soft">
              {t("devotional.empty")}
            </p>
          ) : (
            <ul className="mt-14 border-t border-lp-ink sm:mt-20">
              {result.items.map((devotional) => (
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
                      ? t("devotional.byline", {
                          author: devotional.authorName,
                        })
                      : undefined
                  }
                  action={t("devotional.readMore")}
                />
              ))}
            </ul>
          )}

          {result.pageCount > 1 ? (
            <nav
              aria-label={t("devotional.paginationLabel")}
              className="mt-12 flex items-center justify-between gap-6"
            >
              {page > 1 ? (
                <Link
                  href={page === 2 ? "/renungan" : `/renungan?page=${page - 1}`}
                  className="lp-action lp-link-on text-lp-ink transition-colors hover:text-lp-accent"
                  rel="prev"
                >
                  ← {t("devotional.newer")}
                </Link>
              ) : (
                <span />
              )}

              <span className="lp-small text-lp-ink-faint">
                {t("devotional.pageOf", {
                  page: result.page,
                  total: result.pageCount,
                })}
              </span>

              {page < result.pageCount ? (
                <Link
                  href={`/renungan?page=${page + 1}`}
                  className="lp-action lp-link-on text-lp-ink transition-colors hover:text-lp-accent"
                  rel="next"
                >
                  {t("devotional.older")} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </section>

      <LandingFooter sections={sections} />
    </main>
  );
}
