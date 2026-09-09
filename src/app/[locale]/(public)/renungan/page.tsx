import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Inter, Newsreader } from "next/font/google";
import type { Metadata } from "next";

import { LandingNav } from "@/components/landing/landing-nav";
import { MotionGate } from "@/components/landing/motion-gate";
import { PublicFooter } from "@/components/landing/public-footer";
import { RevealStage } from "@/components/landing/reveal";
import { ScrollStage } from "@/components/landing/scroll-stage";
import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";
import { excerpt } from "@/lib/markdown";
import { listPublicDevotionalsPage } from "@/server/queries/devotionals";

import "@/styles/landing/index.css";

const displaySerif = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-sm-serif",
  display: "swap",
});

const operationalSans = Inter({
  subsets: ["latin"],
  variable: "--font-sm-sans",
  display: "swap",
});

/**
 * Re-rendered hourly as a backstop. The mutations already call
 * `revalidatePath("/renungan")`, so a new devotional appears immediately; this
 * only covers a scheduled `publishedAt` falling due with nobody editing
 * anything.
 */
export const revalidate = 3600;

const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lp.devotional");
  const locale = await getLocale();
  const title = t("archiveTitle");
  const description = t("metaDescription", { church: church.name });
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
 * had not signed in. Everything here is readable without an account.
 *
 * Set as a ruled index rather than a grid of cards: a date in the liturgical
 * margin, the title in the narrative column. It is the same rhythm as the
 * service table on the landing page, because both are indexes of dated facts.
 */
export default async function DevotionalArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  const requested = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [t, locale, result] = await Promise.all([
    getTranslations("lp"),
    getLocale(),
    listPublicDevotionalsPage({ page: requested, pageSize: PAGE_SIZE }),
  ]);
  const df = dateFnsLocale(locale);
  const { items, page, pageCount, total } = result;

  return (
    <div
      id="sm-root"
      className={`sm-root ${displaySerif.variable} ${operationalSans.variable}`}
      suppressHydrationWarning
    >
      <MotionGate />

      <a href="#utama" className="sm-skip sm-action">
        {t("nav.skip")}
      </a>

      <ScrollStage>
        <RevealStage />
        {/* `page`, not `landing`: the section links have to leave this route. */}
        <LandingNav variant="page" />

        <main id="utama" className="sm-tone-light">
          <div className="sm-section-tall sm-shell">
            <div className="sm-opener">
              <p className="sm-opener-kicker sm-label sm-eyebrow">
                {t("devotional.label")}
              </p>
              <h1 className="sm-opener-title sm-h1" data-sm-split>
                {t("devotional.archiveTitle")}
              </h1>
              <p
                className="sm-opener-lead sm-lead"
                style={{ color: "var(--sm-ink-2)" }}
                data-sm-reveal="up"
              >
                {t("devotional.archiveLead", { church: church.name })}
              </p>
            </div>

            <div className="sm-archive" style={{ marginTop: "3.5rem" }}>
              {items.length === 0 ? (
                <p className="sm-archive-empty sm-body">
                  {t("devotional.archiveEmpty")}
                </p>
              ) : (
                items.map((d) => (
                  <Link
                    key={d.id}
                    href={`/renungan/${d.slug}`}
                    className="sm-archive-item"
                  >
                    <p className="sm-label sm-archive-date">
                      {formatJakarta(d.publishedAt, "d MMM yyyy", df)}
                    </p>
                    <div className="sm-archive-body">
                      <h2 className="sm-h3 sm-archive-title">{d.title}</h2>
                      <p className="sm-small sm-archive-excerpt">
                        {excerpt(d.body, 190)}
                      </p>
                      <p className="sm-label sm-archive-meta">
                        {d.verseRef ? <span>{d.verseRef}</span> : null}
                        {d.authorName ? <span>{d.authorName}</span> : null}
                      </p>
                    </div>
                    <ArrowRight className="sm-archive-arrow h-5 w-5" aria-hidden />
                  </Link>
                ))
              )}
            </div>

            {pageCount > 1 ? (
              <nav
                className="sm-pager"
                style={{ marginTop: "2.5rem" }}
                aria-label={t("devotional.archiveTitle")}
              >
                <p className="sm-label sm-pager-count">
                  {t("devotional.page", { page, pageCount })}
                  <span aria-hidden> · </span>
                  {t("devotional.count", { count: total })}
                </p>
                <div className="sm-pager-links">
                  {page > 1 ? (
                    <Link
                      href={page - 1 === 1 ? "/renungan" : `/renungan?page=${page - 1}`}
                      className="sm-btn sm-btn-ghost sm-btn-sm sm-action"
                      rel="prev"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      {t("devotional.newer")}
                    </Link>
                  ) : null}
                  {page < pageCount ? (
                    <Link
                      href={`/renungan?page=${page + 1}`}
                      className="sm-btn sm-btn-ghost sm-btn-sm sm-action"
                      rel="next"
                    >
                      {t("devotional.older")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </div>
        </main>

        <PublicFooter />
      </ScrollStage>
    </div>
  );
}
