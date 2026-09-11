import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LandingNav } from "@/components/landing/landing-nav";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { MotionGate } from "@/components/landing/motion-gate";
import { PublicFooter } from "@/components/landing/public-footer";
import { RevealStage } from "@/components/landing/reveal";
import { ScrollStage } from "@/components/landing/scroll-stage";
import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";
import { excerpt } from "@/lib/markdown";
import {
  getAdjacentPublicDevotionals,
  getPublicDevotionalBySlug,
  listPublicDevotionalSlugs,
} from "@/server/queries/devotionals";

import "@/styles/landing/index.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

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
  return locale === "id" ? `/renungan/${slug}` : `/${locale}/renungan/${slug}`;
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
 * Set in the landing page's own palette and type scale rather than in the M3
 * roles, for a reason that is not cosmetic: this is a public page, and the M3
 * roles flip under `.dark`. A visitor whose OS is in dark mode would otherwise
 * get light-on-dark prose inside a warm paper page. The `sm-*` tokens are
 * declared once and never redefined.
 */
export default async function PublicDevotionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const devotional = await getPublicDevotionalBySlug(slug);
  if (!devotional) notFound();

  const [t, locale, adjacent] = await Promise.all([
    getTranslations("lp"),
    getLocale(),
    getAdjacentPublicDevotionals(devotional.publishedAt),
  ]);
  const df = dateFnsLocale(locale);
  const url = `${church.siteUrl}${canonicalPath(locale, slug)}`;

  /**
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
    publisher: { "@type": "Church", name: church.name, url: church.siteUrl },
  };

  return (
    <div
      id="sm-root"
      className={`sm-root ${manrope.variable}`}
      style={{ "--hero-primary": church.primaryColor } as React.CSSProperties}
      suppressHydrationWarning
    >
      <MotionGate />
      <script
        type="application/ld+json"
        // Built from our own database rows, not from user input, and
        // JSON.stringify escapes the content.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="#utama" className="sm-skip sm-action">
        {t("nav.skip")}
      </a>

      <ScrollStage>
        <RevealStage />
        <LandingNav variant="page" />

        <main id="utama" className="sm-tone-light">
          <article className="sm-section-tall sm-shell">
            <div className="sm-article">
              {/* Sticky in the liturgical margin on wide viewports: the date,
                  the author and the way back stay with the reader instead of
                  scrolling off the top of a long devotional. */}
              <div className="sm-article-meta">
                <Link href="/renungan" className="sm-back sm-action">
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {t("devotional.articleBack")}
                </Link>
                <p className="sm-label sm-eyebrow" style={{ marginTop: "1rem" }}>
                  {t("devotional.publishedOn")}
                </p>
                <p className="sm-h4">
                  {formatJakarta(devotional.publishedAt, "d MMMM yyyy", df)}
                </p>
                {devotional.authorName ? (
                  <>
                    <p
                      className="sm-label sm-eyebrow"
                      style={{ marginTop: "0.75rem" }}
                    >
                      {t("devotional.by")}
                    </p>
                    <p className="sm-small">{devotional.authorName}</p>
                  </>
                ) : null}
              </div>

              <div className="sm-article-main">
                <h1 className="sm-h1 sm-article-title" data-sm-split>
                  {devotional.title}
                </h1>

                {devotional.verseRef ? (
                  <div className="sm-verse" data-sm-reveal="up">
                    <p className="sm-label sm-verse-ref">
                      {devotional.verseRef}
                    </p>
                    {devotional.verseText ? (
                      <p className="sm-lead sm-verse-text sm-em">
                        {devotional.verseText}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <MarkdownContent source={devotional.body} tone="paper" />

                {adjacent.previous || adjacent.next ? (
                  <nav
                    className="sm-article-adjacent"
                    aria-label={t("devotional.archiveTitle")}
                  >
                    {adjacent.previous ? (
                      <Link
                        href={`/renungan/${adjacent.previous.slug}`}
                        className="sm-adjacent"
                        rel="prev"
                      >
                        <span className="sm-label sm-adjacent-label">
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                          {t("devotional.prev")}
                        </span>
                        <span className="sm-h4 sm-adjacent-title">
                          {adjacent.previous.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}
                    {adjacent.next ? (
                      <Link
                        href={`/renungan/${adjacent.next.slug}`}
                        className="sm-adjacent sm-adjacent-next"
                        rel="next"
                      >
                        <span className="sm-label sm-adjacent-label">
                          {t("devotional.next")}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="sm-h4 sm-adjacent-title">
                          {adjacent.next.title}
                        </span>
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </div>
            </div>
          </article>
        </main>

        <PublicFooter />
      </ScrollStage>
    </div>
  );
}
