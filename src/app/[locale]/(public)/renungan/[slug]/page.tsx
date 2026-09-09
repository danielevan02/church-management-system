import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LoadingLink } from "@/components/shared/loading-link";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { church } from "@/config/church";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import {
  getAdjacentPublicDevotionals,
  getPublicDevotionalBySlug,
  listPublicDevotionalSlugs,
} from "@/server/queries/devotionals";
import { getPublicSections } from "@/server/queries/public-sections";

export const revalidate = 3600;

/**
 * Pre-render every devotional that exists at build time.
 *
 * `dynamicParams` stays at its default of true, so one published after the
 * build is rendered on demand and then cached — a church must not have to
 * redeploy to publish.
 */
export async function generateStaticParams() {
  const rows = await listPublicDevotionalSlugs();
  return rows.map((row) => ({ slug: row.slug }));
}

function canonicalPath(locale: string, slug: string) {
  return locale === "id"
    ? `/renungan/${slug}`
    : `/${locale}/renungan/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const devotional = await getPublicDevotionalBySlug(slug);
  if (!devotional) return {};

  const locale = await getLocale();
  // The verse is the human-written summary when there is one; otherwise the
  // opening of the body. Never the title again — a description that restates
  // the title is the most common way a page wastes its own search snippet.
  const description = excerpt(devotional.verseText || devotional.body, 155);
  const url = `${church.siteUrl}${canonicalPath(locale, slug)}`;

  return {
    title: devotional.title,
    description,
    authors: devotional.authorName
      ? [{ name: devotional.authorName }]
      : undefined,
    alternates: {
      canonical: url,
      languages: {
        id: `${church.siteUrl}/renungan/${slug}`,
        en: `${church.siteUrl}/en/renungan/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: devotional.title,
      description,
      siteName: church.name,
      url,
      locale: locale === "id" ? "id_ID" : "en_US",
      publishedTime: devotional.publishedAt.toISOString(),
      modifiedTime: devotional.updatedAt.toISOString(),
      authors: devotional.authorName ? [devotional.authorName] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: devotional.title,
      description,
    },
  };
}

/**
 * A single devotional, readable by anyone.
 *
 * The page is set in the landing page's paper palette rather than in M3,
 * because it is part of the public site: it has to look identical for a
 * visitor whose OS is in dark mode, and `lp-*` tokens are the ones that do not
 * flip. See `styles/landing.css`.
 */
export default async function PublicDevotionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const devotional = await getPublicDevotionalBySlug(slug);
  if (!devotional) notFound();

  const [t, locale, sections, adjacent] = await Promise.all([
    getTranslations("landing"),
    getLocale(),
    getPublicSections(),
    getAdjacentPublicDevotionals(devotional.publishedAt),
  ]);
  const df = dateFnsLocale(locale);
  const url = `${church.siteUrl}${canonicalPath(locale, slug)}`;

  /*
   * Structured data. `BlogPosting` rather than `Article` because a devotional
   * is a dated entry in a continuing series, which is what earns the
   * date-stamped treatment in a search result.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: devotional.title,
    description: excerpt(devotional.verseText || devotional.body, 155),
    datePublished: devotional.publishedAt.toISOString(),
    dateModified: devotional.updatedAt.toISOString(),
    inLanguage: locale === "id" ? "id-ID" : "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": devotional.authorName ? "Person" : "Organization",
      name: devotional.authorName ?? church.name,
    },
    publisher: {
      "@type": "Church",
      name: church.name,
      url: church.siteUrl,
    },
  };

  return (
    <main className="flex min-h-dvh flex-col bg-lp-paper text-lp-ink selection:bg-lp-accent/15 selection:text-lp-ink">
      <script
        type="application/ld+json"
        // The payload is built from our own database rows, not from user
        // input, and JSON.stringify escapes the content.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingHeader sections={sections} />

      <article className="border-t border-lp-rule">
        <div className="mx-auto w-full max-w-320 px-6 py-16 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
          <Link
            href="/renungan"
            className="lp-action group inline-flex items-center gap-1.5 text-lp-ink-soft transition-colors hover:text-lp-accent"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            <span className="lp-link">{t("devotional.backToArchive")}</span>
          </Link>

          <div className="mt-10 grid gap-x-10 gap-y-12 lg:grid-cols-12">
            {/* Masthead rail: date and byline, out of the reading column. */}
            <div className="lg:col-span-3">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-lp-ink pb-3 lg:flex-col lg:items-start">
                <time
                  dateTime={devotional.publishedAt.toISOString()}
                  className="lp-label text-lp-ink"
                >
                  {formatJakarta(devotional.publishedAt, "d MMMM yyyy", df)}
                </time>
                {devotional.authorName ? (
                  <span className="lp-label text-lp-ink-faint">
                    {t("devotional.byline", { author: devotional.authorName })}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-8">
              <h1 className="lp-h2 text-balance text-lp-ink">
                {devotional.title}
              </h1>

              {devotional.verseRef || devotional.verseText ? (
                <figure className="mt-10 border-l-2 border-lp-accent bg-lp-sand py-6 pr-6 pl-6 sm:pl-8">
                  {devotional.verseText ? (
                    <blockquote className="lp-quote text-balance text-lp-ink">
                      &ldquo;{devotional.verseText}&rdquo;
                    </blockquote>
                  ) : null}
                  {devotional.verseRef ? (
                    <figcaption
                      className={`lp-label text-lp-accent ${devotional.verseText ? "mt-5" : ""}`}
                    >
                      {devotional.verseRef}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              <MarkdownContent
                source={devotional.body}
                tone="paper"
                className="mt-10 prose-base prose-p:leading-[1.75] sm:prose-lg"
              />

              {/* Adjacent readings: how a reader moves through a series, and
                  how a crawler reaches every devotional without depending on
                  the paginated index. */}
              {adjacent.previous || adjacent.next ? (
                <nav
                  aria-label={t("devotional.moreLabel")}
                  className="mt-16 grid gap-px border-t border-lp-ink bg-lp-rule sm:grid-cols-2"
                >
                  {adjacent.previous ? (
                    <Link
                      href={`/renungan/${adjacent.previous.slug}`}
                      rel="prev"
                      className="group flex flex-col gap-2 bg-lp-paper py-6 pr-6 transition-colors sm:pr-8"
                    >
                      <span className="lp-label text-lp-ink-faint">
                        ← {t("devotional.newer")}
                      </span>
                      <span className="lp-h3 text-pretty text-lp-ink transition-colors group-hover:text-lp-accent">
                        {adjacent.previous.title}
                      </span>
                    </Link>
                  ) : (
                    <span className="hidden bg-lp-paper sm:block" />
                  )}

                  {adjacent.next ? (
                    <Link
                      href={`/renungan/${adjacent.next.slug}`}
                      rel="next"
                      className="group flex flex-col gap-2 bg-lp-paper py-6 sm:items-end sm:pl-8 sm:text-right"
                    >
                      <span className="lp-label text-lp-ink-faint">
                        {t("devotional.older")} →
                      </span>
                      <span className="lp-h3 text-pretty text-lp-ink transition-colors group-hover:text-lp-accent">
                        {adjacent.next.title}
                      </span>
                    </Link>
                  ) : null}
                </nav>
              ) : null}

              <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-lp-rule pt-8">
                <LoadingLink
                  href="/auth/member"
                  className="lp-action h-11 rounded-full bg-lp-ink px-6 text-lp-paper transition-colors hover:bg-lp-accent-deep"
                >
                  {t("footer.memberCta")}
                </LoadingLink>
                <Link
                  href="/renungan"
                  className="lp-action group inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
                >
                  <span className="lp-link-on">
                    {t("devotional.archiveCta")}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <LandingFooter sections={sections} />
    </main>
  );
}
