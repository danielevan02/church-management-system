import { existsSync } from "node:fs";
import path from "node:path";

import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Manrope } from "next/font/google";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Metadata } from "next";

import { DevotionalList } from "@/components/landing/devotional-list";
import { GivingPanel } from "@/components/landing/giving-panel";
import { HeroSanctuary } from "@/components/landing/hero-sanctuary";
import { LandingNav } from "@/components/landing/landing-nav";
import { PublicFooter } from "@/components/landing/public-footer";
import { RevealStage } from "@/components/landing/reveal";
import { RoomAudio } from "@/components/landing/room-audio";
import { SanctuaryReplay } from "@/components/landing/sanctuary-replay";
import { ScrollStage } from "@/components/landing/scroll-stage";
import { SundayExperience } from "@/components/landing/sunday-experience";
import { WorshipSchedule } from "@/components/landing/worship-schedule";
import { MotionGate } from "@/components/landing/motion-gate";
import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import {
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

          {/* ============================================================
           * CERITA — the photo essay. Asymmetric on purpose: a full-bleed
           * breakout, then an offset pair at different heights, so the eye
           * never settles into a grid of equal cards.
           * ============================================================ */}
          <section
            id="cerita"
            className="sm-tone-light sm-clerestory"
            aria-labelledby="sm-cerita-title"
          >
            <div className="sm-section sm-shell sm-opener">
              <p className="sm-opener-kicker sm-label sm-eyebrow">
                {t("stories.label")}
              </p>
              <h2
                id="sm-cerita-title"
                className="sm-opener-title sm-h1"
                data-sm-split
              >
                {t("stories.title")}
              </h2>
              <p
                className="sm-opener-lead sm-lead"
                style={{ color: "var(--sm-ink-2)" }}
                data-sm-reveal="up"
              >
                {t("stories.lead")}
              </p>
            </div>

            {/* Full-bleed breakout. 21:9 keeps the congregation's symmetry and
                gives the type somewhere to overlap without covering faces. */}
            <figure className="sm-breakout" data-sm-mask>
              <div className="sm-breakout-media" data-sm-parallax="9">
                <Image
                  src="/landing-page/gathering.jpeg"
                  alt={t("photo.gathering.alt")}
                  fill
                  sizes="100vw"
                  quality={80}
                  className="sm-breakout-img"
                />
              </div>
              <figcaption className="sm-breakout-caption">
                <span className="sm-label">{t("photo.gathering.caption")}</span>
                <span className="sm-small sm-breakout-credit">
                  {t("photo.gathering.credit")}
                </span>
              </figcaption>
            </figure>

            <div className="sm-section sm-shell">
              <div className="sm-essay">
                <figure className="sm-essay-wide sm-figure" data-sm-mask>
                  <Image
                    src="/landing-page/fellowship.jpeg"
                    alt={t("photo.fellowship.alt")}
                    width={2752}
                    height={1536}
                    sizes="(max-width: 62rem) 92vw, 56vw"
                    quality={78}
                  />
                  <figcaption className="sm-essay-caption sm-small">
                    {t("photo.fellowship.caption")}
                  </figcaption>
                </figure>

                <div className="sm-essay-note" data-sm-stagger>
                  <p className="sm-label sm-eyebrow" data-sm-reveal="up">
                    {t("stories.noteWhen")}
                  </p>
                  <h3 className="sm-h3" data-sm-reveal="up">
                    {t("stories.noteTitle")}
                  </h3>
                  <p className="sm-body" data-sm-reveal="up">
                    {t("stories.noteBody")}
                  </p>
                </div>

                <figure className="sm-essay-square sm-figure" data-sm-mask>
                  <Image
                    src="/landing-page/detail.jpeg"
                    alt={t("photo.detail.alt")}
                    width={2048}
                    height={2048}
                    sizes="(max-width: 62rem) 92vw, 34vw"
                    quality={80}
                  />
                  <figcaption className="sm-essay-caption sm-small">
                    {t("photo.detail.caption")}
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          {/* THE SUNDAY EXPERIENCE — pinned five-chapter liturgy */}
          <SundayExperience whatsappHref={secretariatHref} />

          {/* ============================================================
           * RUANG & SUARA — the room's own recording, and how we teach.
           * A second chapter of the same dark room, divided by a hairline
           * rather than by a change of ground.
           * ============================================================ */}
          <section
            className="sm-tone-dark sm-tone-dark-2 sm-section sm-rule-t"
            aria-labelledby="sm-suara-title"
          >
            <div className="sm-shell sm-suara">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-5">
                  <p className="sm-label sm-eyebrow">{t("sermon.label")}</p>
                  <h2 id="sm-suara-title" className="sm-h2" data-sm-split>
                    {t("sermon.title")}
                  </h2>
                  <p
                    className="sm-body max-w-[48ch]"
                    style={{ color: "var(--sm-fg-muted)" }}
                    data-sm-reveal="up"
                  >
                    {t("sermon.lead")}
                  </p>
                </div>
                <RoomAudio />
              </div>

              <div className="sm-suara-teaching">
                <div className="flex flex-col gap-4">
                  <p className="sm-label sm-eyebrow">
                    {t("sermon.teachingLabel")}
                  </p>
                  <h3 className="sm-h3">{t("sermon.teachingTitle")}</h3>
                  <p
                    className="sm-body"
                    style={{ color: "var(--sm-fg-muted)" }}
                  >
                    {t("sermon.teachingLead")}
                  </p>
                </div>

                <SanctuaryReplay />

                <p className="sm-small sm-suara-archive sm-rule-t">
                  {t("sermon.archiveNote")}
                  <Link href="/auth/member" className="sm-link sm-suara-link">
                    {t("nav.portal")}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================
           * RENUNGAN — the church's own writing, public and crawlable.
           * Placed straight after the teaching section: it is the same thread
           * continued in print, and the tonal cut from obsidian to limestone
           * is what marks it as a different kind of reading.
           * ============================================================ */}
          {devotionals.length ? (
            <section
              id="renungan"
              className="sm-tone-light sm-clerestory sm-section"
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
                    {t("devotional.title")}
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
              <figure className="sm-nextgen-figure sm-figure sm-figure-warm" data-sm-mask>
                <Image
                  src="/landing-page/nextgen.jpeg"
                  alt={t("photo.nextgen.alt")}
                  width={2400}
                  height={1792}
                  sizes="(max-width: 62rem) 92vw, 48vw"
                  quality={80}
                />
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
                  {(["safety", "curriculum", "teachers", "youth"] as const).map(
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
           * RENCANAKAN KUNJUNGAN — the threshold, closing the page where the
           * footage opened it: at a door.
           * ============================================================ */}
          <section
            id="rencanakan"
            className="sm-tone-dark sm-visit"
            aria-labelledby="sm-visit-title"
          >
            <div className="sm-visit-plate" aria-hidden>
              <Image
                src="/landing-page/visit.jpeg"
                alt=""
                fill
                sizes="100vw"
                quality={80}
                className="sm-visit-img"
              />
            </div>

            <div className="sm-shell sm-visit-body">
              <div className="sm-visit-copy">
                <p className="sm-label sm-eyebrow">{t("visit.label")}</p>
                <h2 id="sm-visit-title" className="sm-h1" data-sm-split>
                  {t("visit.title")}
                </h2>
                <p
                  className="sm-lead max-w-[44ch]"
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
                      {t("visit.cta")}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  ) : null}
                  <a
                    href={campus.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-btn sm-btn-ghost sm-action"
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                    {t("visit.secondary")}
                  </a>
                </div>
              </div>

              <ol className="sm-visit-steps" data-sm-stagger>
                {(["one", "two", "three"] as const).map((k, i) => (
                  <li key={k} className="sm-visit-step" data-sm-reveal="up">
                    <span className="sm-label sm-visit-step-index">
                      0{i + 1}
                    </span>
                    <p className="sm-h4">{t(`visit.steps.${k}.title`)}</p>
                    <p className="sm-small" style={{ color: "var(--sm-fg-muted)" }}>
                      {t(`visit.steps.${k}.body`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </main>

        <PublicFooter />
      </ScrollStage>
    </div>
  );
}
