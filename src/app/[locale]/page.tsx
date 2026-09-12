import { existsSync } from "node:fs";
import path from "node:path";

import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Manrope } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { CommunityFellowship } from "@/components/landing/community-fellowship";
import { DevotionalList } from "@/components/landing/devotional-list";
import { GivingPanel } from "@/components/landing/giving-panel";
import { HeroSanctuary } from "@/components/landing/hero-sanctuary";
import { LandingNav } from "@/components/landing/landing-nav";
import { PublicFooter } from "@/components/landing/public-footer";
import { RevealStage } from "@/components/landing/reveal";
import { ScrollStage } from "@/components/landing/scroll-stage";
import { SundayExperience } from "@/components/landing/sunday-experience";
import { WorshipSchedule } from "@/components/landing/worship-schedule";
import { MotionGate } from "@/components/landing/motion-gate";
import { church } from "@/config/church";
import {
  SERVICE_SLOTS,
  campus,
  whatsappLink,
} from "@/config/campus";
import { dateFnsLocale } from "@/lib/datetime";
import { listPublicDevotionals } from "@/server/queries/devotionals";

import "@/styles/landing/index.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lp.meta");
  return {
    title: `${church.shortName} — ${t("title")}`,
    description: t("description"),
    openGraph: {
      title: `${church.name}`,
      description: t("description"),
      images: [{ url: "/landing-page/hero-poster.jpg", width: 1920, height: 1080 }],
      type: "website",
    },
  };
}

export default async function Home() {
  const t = await getTranslations("lp");
  const locale = await getLocale();
  const df = dateFnsLocale(locale);

  /**
   * Whether this deployment has actually shipped a QRIS image.
   *
   * Checked on the filesystem rather than by looking at the env var, because
   * the var has a default and a default pointing at a file nobody uploaded is
   * exactly how you end up rendering a broken image in a giving section. The
   * page prerenders, so this runs at build time against the real `public/`
   * directory; the client-side countdown rolls stale service times forward by
   * whole weeks on its own, which is what lets the whole page be static.
   */
  const qrisPath = church.bank.qrisImagePath;
  const qrisSrc = existsSync(path.join(process.cwd(), "public", qrisPath))
    ? qrisPath
    : null;

  // Four: one lead plus three in the index beside it.
  const devotionals = await listPublicDevotionals(4);

  const visitHref = whatsappLink(t("visit.waMessage", { church: church.name }));
  const nextgenHref = whatsappLink(
    t("nextgen.waMessage", { church: church.name }),
  );
  const confirmHref = church.bank.accountNumber
    ? whatsappLink(
        t("giving.confirmMessage", {
          bank: church.bank.name,
          account: church.bank.accountNumber,
        }),
        campus.whatsapp || church.bank.confirmationWhatsApp.replace(/\D/g, ""),
      )
    : "";
  const secretariatHref = whatsappLink(
    t("visit.waMessage", { church: church.name }),
  );

  return (
    <div
      id="sm-root"
      className={`sm-root ${manrope.variable}`}
      style={{ "--hero-primary": church.primaryColor } as React.CSSProperties}
      /* `MotionGate` writes `data-motion` on this element during HTML parsing,
       * before React has hydrated. React then finds an attribute it did not
       * render and reports a mismatch it explicitly will not patch up. This is
       * the documented escape hatch for an element whose attributes are managed
       * outside React, and it is the honest description of what happens here —
       * the alternative is setting the pre-reveal state after first paint,
       * which flashes the resolved layout. */
      suppressHydrationWarning
    >
      <MotionGate />

      <a href="#utama" className="sm-skip sm-action">
        {t("nav.skip")}
      </a>

      <ScrollStage>
        <RevealStage />
        <LandingNav />

        <main id="utama">
          <div className="hero-curtain-stage">
            <HeroSanctuary />
            <WorshipSchedule />
          </div>

            {/* ============================================================
             * THE NAVE — opens on the exact obsidian the hero fades to, so the
             * handoff has no seam. The 4-card feature strip sits at the top,
             * followed by the verse and vision statement.
             * ============================================================ */}
            <section
              id="mengapa"
              className="sm-tone-dark sm-section-tall sm-nave-stacked"
              aria-labelledby="sm-nave-title"
            >
              <div className="sm-shell sm-opener">
                <p className="sm-opener-kicker sm-label sm-eyebrow sm-nave-kicker">
                  {t("vision.label")}
                </p>
                <blockquote className="sm-opener-title sm-nave-quote">
                  <p className="sm-quote sm-nave-quote-text" data-sm-split>
                    {t("vision.verse")}
                  </p>
                  <cite className="sm-label sm-nave-cite">
                    {t("vision.verseRef")}
                  </cite>
                </blockquote>

                <div
                  className="sm-opener-lead sm-nave-statement"
                  data-sm-stagger
                >
                  <p className="sm-label sm-eyebrow sm-nave-statement-kicker" data-sm-reveal="up">
                    {t("vision.statementLabel")}
                  </p>
                  <h2 id="sm-nave-title" className="sm-h4 sm-nave-statement-title" data-sm-reveal="up">
                    {t("vision.statement")}
                  </h2>
                  <p
                    className="sm-body sm-nave-statement-desc"
                    style={{ color: "var(--sm-fg-muted)" }}
                    data-sm-reveal="up"
                  >
                    {t("vision.body")}
                  </p>
                </div>
              </div>
            </section>

          {/* THE SUNDAY EXPERIENCE — pinned five-chapter liturgy */}
          <SundayExperience whatsappHref={secretariatHref} />

          {/* ============================================================
           * PERSEKUTUAN & KOMUNITAS — Editorial Bento Grid
           * ============================================================ */}
          <CommunityFellowship />

          {/* ============================================================
           * RENUNGAN — the church's own writing, public and crawlable.
           * Placed straight after the teaching section: it is the same thread
           * continued in print, and the tonal cut from obsidian to limestone
           * is what marks it as a different kind of reading.
           * ============================================================ */}
          {devotionals.length ? (
            <section
              id="renungan"
              className="sm-tone-light sm-section"
              aria-labelledby="sm-renungan-title"
            >
              <div className="sm-shell">
                <div className="sm-opener">
                  <p className="sm-opener-kicker sm-label sm-eyebrow">
                    {t("devotional.label")}
                  </p>
                  <h2
                    id="sm-renungan-title"
                    className="sm-opener-title sm-h1"
                    data-sm-split
                  >
                    {t("devotional.titleLine1")}
                    <br />
                    {t("devotional.titleLine2")}
                  </h2>
                  <p
                    className="sm-opener-lead sm-lead"
                    style={{ color: "var(--sm-ink-2)" }}
                    data-sm-reveal="up"
                  >
                    {t("devotional.lead")}
                  </p>
                </div>

                <DevotionalList
                  items={devotionals}
                  dateLocale={df}
                  copy={{
                    todayLabel: t("devotional.todayLabel"),
                    read: t("devotional.read"),
                    all: t("devotional.all"),
                  }}
                />
              </div>
            </section>
          ) : null}

          {/* ============================================================
           * SEKOLAH MINGGU & REMAJA
           * ============================================================ */}
          <section
            className="sm-tone-linen sm-section"
            aria-labelledby="sm-nextgen-title"
          >
            <div className="sm-shell sm-nextgen">
              <figure className="sm-nextgen-figure" data-sm-mask>
                <div className="sm-nextgen-plate sm-figure sm-figure-warm">
                  <div className="sm-parallax" data-sm-parallax>
                    <Image
                      src="/landing-page/nextgen.jpeg"
                      alt={t("photo.nextgen.alt")}
                      fill
                      sizes="(max-width: 62rem) 92vw, 48vw"
                      quality={80}
                    />
                  </div>
                </div>
                <figcaption className="sm-essay-caption sm-small">
                  {t("photo.nextgen.caption")}
                </figcaption>
              </figure>

              <div className="sm-nextgen-copy">
                <p className="sm-label sm-eyebrow">{t("nextgen.label")}</p>
                <h2 id="sm-nextgen-title" className="sm-h2" data-sm-split>
                  {t("nextgen.title")}
                </h2>
                <p className="sm-body" style={{ color: "var(--sm-ink-2)" }}>
                  {t("nextgen.lead")}
                </p>

                <dl className="sm-points" data-sm-stagger>
                  {(["curriculum", "teachers", "safety", "youth"] as const).map(
                    (k) => (
                      <div key={k} className="sm-point" data-sm-reveal="up">
                        <dt className="sm-h4">{t(`nextgen.points.${k}.title`)}</dt>
                        <dd
                          className="sm-small"
                          style={{ color: "var(--sm-ink-2)" }}
                        >
                          {t(`nextgen.points.${k}.body`)}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>

                {nextgenHref ? (
                  <a
                    href={nextgenHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-btn sm-btn-ghost sm-action self-start"
                  >
                    {t("nextgen.cta")}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          {/* ============================================================
           * PERSEMBAHAN
           * ============================================================ */}
          <section
            id="persembahan"
            className="sm-tone-light sm-section"
            aria-labelledby="sm-give-title"
          >
            <div className="sm-shell sm-give-layout">
              <div className="flex flex-col gap-6">
                <p className="sm-label sm-eyebrow">{t("giving.label")}</p>
                <h2 id="sm-give-title" className="sm-h1" data-sm-split>
                  {t("giving.title")}
                </h2>
                <p
                  className="sm-lead max-w-[42ch]"
                  style={{ color: "var(--sm-ink-2)" }}
                  data-sm-reveal="up"
                >
                  {t("giving.lead")}
                </p>
                <div className="sm-give-transparency sm-rule-t">
                  <p className="sm-label sm-eyebrow">
                    {t("giving.transparencyLabel")}
                  </p>
                  <p className="sm-small" style={{ color: "var(--sm-ink-2)" }}>
                    {t("giving.transparency")}
                  </p>
                </div>
              </div>

              <div data-sm-reveal="up">
                <GivingPanel
                  bank={{
                    name: church.bank.name,
                    accountNumber: church.bank.accountNumber,
                    accountHolder: church.bank.accountHolder,
                  }}
                  qrisSrc={qrisSrc}
                  confirmHref={confirmHref}
                />
              </div>
            </div>
          </section>

          {/* ============================================================
           * MISI PIKP3 — a numbered editorial list, not a deck of cards.
           * ============================================================ */}
          <section
            className="sm-tone-dark sm-section"
            aria-labelledby="sm-misi-title"
          >
            <div className="sm-shell">
              <div className="sm-opener">
                <p className="sm-opener-kicker sm-label sm-eyebrow">
                  {t("mission.label")}
                </p>
                <div className="sm-opener-title flex flex-col gap-5">
                  <h2 id="sm-misi-title" className="sm-h1 sm-misi-acronym">
                    {t("mission.acronym")}
                  </h2>
                  <p className="sm-label sm-eyebrow sm-misi-expansion">
                    {t("mission.expansion")}
                  </p>
                </div>
                <p
                  className="sm-opener-lead sm-body"
                  style={{ color: "var(--sm-fg-muted)" }}
                  data-sm-reveal="up"
                >
                  {t("mission.lead")}
                </p>
              </div>

              <ol className="sm-misi-list" data-sm-stagger>
                {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                  <li key={n} className="sm-misi-item" data-sm-reveal="up">
                    <span className="sm-label sm-misi-index">0{n}</span>
                    <p className="sm-h3">{t(`mission.item${n}`)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ============================================================
           * VISIT — KUNJUNGI GKJ TANGERANG
           * The threshold: welcoming copy, actions & Sunday schedule on the
           * left, large photographic plate feathered into obsidian on the right.
           * ============================================================ */}
          <section
            id="rencanakan"
            className="sm-tone-dark sm-visit"
            aria-labelledby="sm-visit-title"
          >
            <div
              className="sm-visit-plate"
              data-sm-reveal="fade"
              data-sm-trigger="#rencanakan"
              aria-hidden="true"
            >
              <div className="sm-parallax" data-sm-parallax>
                <Image
                  src="/landing-page/visit.jpeg"
                  alt=""
                  fill
                  sizes="100vw"
                  quality={80}
                  className="sm-visit-img"
                />
              </div>
              <div className="sm-visit-scrim" aria-hidden="true" />
            </div>

            <div className="sm-shell relative z-10">
              <div className="sm-visit-content">
                <div className="sm-visit-copy">
                  <p className="sm-label sm-eyebrow">{t("visit.label")}</p>
                  <h2 id="sm-visit-title" className="sm-h1" data-sm-split>
                    {t("visit.title")}
                  </h2>
                  <p
                    className="sm-lead max-w-[46ch]"
                    style={{ color: "var(--sm-fg-muted)" }}
                    data-sm-reveal="up"
                  >
                    {t("visit.lead")}
                  </p>
                  <div className="sm-visit-actions" data-sm-reveal="up">
                    {visitHref ? (
                      <a
                        href={visitHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-btn sm-btn-primary sm-action"
                      >
                        <span>{t("visit.cta")}</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null}
                    <a
                      href={campus.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-btn sm-btn-ghost sm-action"
                    >
                      <span>{t("visit.secondary")}</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="sm-visit-schedule" data-sm-reveal="up">
                  <p className="sm-visit-schedule-label">
                    {t("visit.scheduleLabel")}
                  </p>
                  <ul className="sm-visit-schedule-list">
                    {SERVICE_SLOTS.filter(
                      (s) => s.weekday === 0 && s.key !== "sekolahMinggu",
                    ).map((slot) => (
                      <li key={slot.key} className="sm-visit-schedule-item">
                        <span className="sm-visit-schedule-time">
                          {slot.time.replace(":", ".")}
                          <span className="sm-visit-schedule-tz">WIB</span>
                        </span>
                        <span className="sm-visit-schedule-name">
                          {t(`schedule.services.${slot.key}.name`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </ScrollStage>
    </div>
  );
}
