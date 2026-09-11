import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Users, BookOpen, HeartHandshake } from "lucide-react";

import { church } from "@/config/church";
import { whatsappLink } from "@/config/campus";

const FELLOWSHIP_HERO_IMAGE = "/landing-page/fellowship.jpeg";
const FELLOWSHIP_DETAIL_IMAGE = "/landing-page/detail.jpeg";

export async function CommunityFellowship() {
  const t = await getTranslations("lp.stories");

  const waHref = whatsappLink(
    t("waMessage", { church: church.shortName }),
  );

  return (
    <section
      id="cerita"
      className="sm-tone-light sm-clerestory sm-fellowship-section"
      aria-labelledby="sm-cerita-title"
    >
      {/* Editorial Masthead */}
      <div className="sm-shell sm-opener">
        <p className="sm-opener-kicker sm-label sm-eyebrow">
          {t("label")}
        </p>
        <h2
          id="sm-cerita-title"
          className="sm-opener-title sm-h1"
          data-sm-split
        >
          {t("title")}
        </h2>
        <p
          className="sm-opener-lead sm-lead"
          style={{ color: "var(--sm-ink-2)" }}
          data-sm-reveal="up"
        >
          {t("lead")}
        </p>
      </div>

      {/* Cinematic Bento Grid Composition */}
      <div className="sm-shell sm-fellowship-shell">
        <div className="sm-fellowship-bento" data-sm-stagger>
          {/* ============================================================
           * CELL 1: DOMINANT VISUAL ANCHOR (7 Cols Desktop)
           * Authentic GKJ Tangerang fellowship room after worship.
           * ============================================================ */}
          <article
            className="sm-fellowship-cell sm-fellowship-cell-hero"
            data-sm-reveal="up"
          >
            <div className="sm-fellowship-hero-media">
              <Image
                src={FELLOWSHIP_HERO_IMAGE}
                alt={t("photoCaption")}
                fill
                sizes="(max-width: 62rem) 100vw, 58vw"
                quality={82}
                className="sm-fellowship-hero-img"
              />
              <div className="sm-fellowship-hero-overlay" aria-hidden="true" />
            </div>

            <div className="sm-fellowship-hero-caption">
              <span className="sm-fellowship-badge">
                {t("photoBadge")}
              </span>
              <p className="sm-fellowship-hero-text">
                {t("photoCaption")}
              </p>
              <span className="sm-fellowship-hero-credit">
                {t("photoCredit")}
              </span>
            </div>
          </article>

          {/* ============================================================
           * CELL 2: PRIMARY PILLAR — PERSEKUTUAN (5 Cols Desktop)
           * ============================================================ */}
          <article
            className="sm-fellowship-cell sm-fellowship-cell-main"
            data-sm-reveal="up"
          >
            <div className="sm-fellowship-card-header">
              <div className="sm-fellowship-index-wrap">
                <span className="sm-fellowship-index">
                  {t("pillars.fellowship.num")}
                </span>
                <span className="sm-label sm-eyebrow sm-fellowship-tag">
                  {t("pillars.fellowship.tag")}
                </span>
              </div>
              <HeartHandshake className="h-5 w-5 sm-fellowship-icon" aria-hidden="true" />
            </div>

            <div className="sm-fellowship-card-content">
              <h3 className="sm-h3 sm-fellowship-card-title">
                {t("pillars.fellowship.title")}
              </h3>
              <p className="sm-fellowship-card-desc">
                {t("pillars.fellowship.desc")}
              </p>
              <p className="sm-fellowship-card-note">
                {t("pillars.fellowship.note")}
              </p>
            </div>

            {waHref && (
              <div className="sm-fellowship-card-footer">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-fellowship-action-link"
                >
                  <span>{t("cta")}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </article>

          {/* ============================================================
           * CELL 3: SECONDARY PILLAR — KELOMPOK KECIL (4 Cols Desktop)
           * ============================================================ */}
          <article
            className="sm-fellowship-cell sm-fellowship-cell-groups"
            data-sm-reveal="up"
          >
            <div className="sm-fellowship-card-header">
              <div className="sm-fellowship-index-wrap">
                <span className="sm-fellowship-index">
                  {t("pillars.groups.num")}
                </span>
                <span className="sm-label sm-eyebrow sm-fellowship-tag">
                  {t("pillars.groups.tag")}
                </span>
              </div>
              <BookOpen className="h-5 w-5 sm-fellowship-icon" aria-hidden="true" />
            </div>

            <div className="sm-fellowship-card-content">
              <h3 className="sm-h3 sm-fellowship-card-title">
                {t("pillars.groups.title")}
              </h3>
              <p className="sm-fellowship-card-desc">
                {t("pillars.groups.desc")}
              </p>
            </div>

            <div className="sm-fellowship-card-footer sm-fellowship-footer-plain">
              <span className="sm-fellowship-meta-hint">
                {t("pillars.groups.note")}
              </span>
            </div>
          </article>

          {/* ============================================================
           * CELL 4: TERTIARY PILLAR — KEGIATAN JEMAAT (5 Cols Desktop)
           * ============================================================ */}
          <article
            className="sm-fellowship-cell sm-fellowship-cell-activities"
            data-sm-reveal="up"
          >
            <div className="sm-fellowship-card-header">
              <div className="sm-fellowship-index-wrap">
                <span className="sm-fellowship-index">
                  {t("pillars.activities.num")}
                </span>
                <span className="sm-label sm-eyebrow sm-fellowship-tag">
                  {t("pillars.activities.tag")}
                </span>
              </div>
              <Users className="h-5 w-5 sm-fellowship-icon" aria-hidden="true" />
            </div>

            <div className="sm-fellowship-card-content">
              <h3 className="sm-h3 sm-fellowship-card-title">
                {t("pillars.activities.title")}
              </h3>
              <p className="sm-fellowship-card-desc">
                {t("pillars.activities.desc")}
              </p>
            </div>

            <div className="sm-fellowship-card-footer sm-fellowship-pills-row">
              <span className="sm-fellowship-pill">{t("pillars.activities.tag1")}</span>
              <span className="sm-fellowship-pill">{t("pillars.activities.tag2")}</span>
              <span className="sm-fellowship-pill">{t("pillars.activities.tag3")}</span>
              <span className="sm-fellowship-pill">{t("pillars.activities.tag4")}</span>
            </div>
          </article>

          {/* ============================================================
           * CELL 5: ATMOSPHERIC DETAIL TILE (3 Cols Desktop)
           * Authentic close-up of Bible, communion cup, and quiet sanctuary detail.
           * ============================================================ */}
          <article
            className="sm-fellowship-cell sm-fellowship-cell-detail"
            data-sm-reveal="up"
          >
            <div className="sm-fellowship-detail-media">
              <Image
                src={FELLOWSHIP_DETAIL_IMAGE}
                alt={t("detailCaption")}
                fill
                sizes="(max-width: 62rem) 100vw, 25vw"
                quality={80}
                className="sm-fellowship-detail-img"
              />
              <div className="sm-fellowship-detail-overlay" aria-hidden="true" />
            </div>

            <div className="sm-fellowship-detail-caption">
              <p className="sm-fellowship-detail-title">
                {t("detailCaption")}
              </p>
              <p className="sm-fellowship-detail-verse">
                {t("detailVerse")}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
