"use client";

import * as React from "react";
import gsap from "gsap";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Link } from "@/lib/i18n/navigation";

import { useAnchorNav } from "./scroll-stage";

const VIDEO_LG = "/landing-page/hero-loop.mp4";
const VIDEO_SM = "/landing-page/hero-loop-sm.mp4";
const VIDEO_POSTER = "/landing-page/hero-poster.jpg";

/** Scroll distance, in viewport heights, over which the hero hands off to
 *  section "mengapa": the shadow dissolves, the scrim lifts, and mengapa
 *  slides out from under the hero. */
const EXIT_TRAVEL_VH = 0.6;
/** How far under the hero section "mengapa" starts tucked before it emerges. */
const MENGAPA_LIFT_VH = 0.4;
/** How small the hero card scrubs down to as it hands off. */
const CARD_SHRINK_SCALE = 0.92;
/** Bottom corner radius, in px, the card reaches at full shrink. */
const CARD_SHRINK_RADIUS = 44;
/** Quantisation step for that radius, in px. See the `onUpdate` below. */
const RADIUS_STEP_PX = 4;
/** How far the plate drifts down inside the card, as a fraction of hero
 *  height, while the card scrubs away — the parallax lag. Must stay under
 *  `--hero-plate-overhang` in the stylesheet or the plate's top edge shows. */
const PLATE_PARALLAX_RATIO = 0.25;

export function HeroSanctuary() {
  const t = useTranslations("lp.hero");
  const tNav = useTranslations("lp.nav");
  const reduce = useReducedMotion();
  const onAnchor = useAnchorNav();

  const rootRef = React.useRef<HTMLElement>(null);
  const bgVideoRef = React.useRef<HTMLVideoElement>(null);
  const [bgVideoReady, setBgVideoReady] = React.useState(false);

  // Background Altar Video playback management
  React.useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      video.removeAttribute("src");
      video.pause();
      setBgVideoReady(false);
      return;
    }

    const small = window.matchMedia("(max-width: 48rem)").matches;
    video.src = small ? VIDEO_SM : VIDEO_LG;
    video.load();

    const onReady = () => setBgVideoReady(true);
    video.addEventListener("loadeddata", onReady);
    const play = video.play();
    if (play) play.catch(() => setBgVideoReady(false));

    return () => video.removeEventListener("loadeddata", onReady);
  }, [reduce]);

  // GSAP Animations: Arrival and Scroll Exit
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;

    const stage = (root.closest(".hero-curtain-stage") as HTMLElement | null) || root.parentElement;
    const nextSectionEl =
      (stage ? stage.querySelector<HTMLElement>("#ibadah, #mengapa") : null) ||
      document.getElementById("ibadah") ||
      document.getElementById("mengapa");

    gsap.registerPlugin(ScrollTrigger);

    const cardEl = root.querySelector<HTMLElement>(".hero-card");

    const ctx = gsap.context(() => {
      // 1. Entrance Timeline: Headline, nav links, and subtitle/portal button
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero-line]",
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: "power3.out",
        },
        0,
      )
        .fromTo(
          "[data-hero-nav-item]",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1.15,
            stagger: 0.08,
            ease: "power3.out",
          },
          0,
        )
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 1.15,
            ease: "power3.out",
          },
          0.08,
        );

      // 2. Emergence & Reveal, scrubbed to the same scroll range and driven
      // by one ScrollTrigger rather than three: section mengapa starts tucked
      // under the hero and slides out, the hero's own drop shadow dissolves,
      // and its scrim lifts — all in lockstep as the hero hands off to the
      // page. From this point onward, hero and mengapa scroll up together
      // naturally (normal scroll).
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * EXIT_TRAVEL_VH}`,
          // Numeric, not `true`. `scrub: true` pins progress to the raw scroll
          // position, so the animation inherits every irregularity in how the
          // browser dispatches scroll — trackpad and smooth-scroll events do
          // not arrive one per frame, which is what reads as stutter. A number
          // makes GSAP lerp toward the target on rAF instead: one update per
          // painted frame, and the ~0.6s catch-up smooths the gaps.
          scrub: 0.6,
          // The plate drift and the section lift are both function-based
          // values measured off the viewport; without this they keep their
          // first-run numbers after a resize or orientation change.
          invalidateOnRefresh: true,
        },
      });
      if (nextSectionEl) {
        exitTl.fromTo(
          nextSectionEl,
          { y: () => -window.innerHeight * MENGAPA_LIFT_VH },
          { y: 0, ease: "none" },
          0,
        );
      }
      exitTl
        // The card scrubs smaller and rounds its bottom corners. The shadow is
        // deliberately NOT animated here — it is static in the stylesheet.
        // Interpolating a 60px-blur shadow meant re-rasterizing a full-viewport
        // layer with a playing video in it on every frame, which is the bulk of
        // the jank; parked in CSS it is rasterized once and the compositor just
        // scales the result. It stays below the fold at rest and slides into
        // view on its own as the card lifts, so nothing is lost visually.
        .fromTo(
          ".hero-card",
          { scale: 1 },
          { scale: CARD_SHRINK_SCALE, ease: "none" },
          0,
        )
        // The plate sinks inside the card as the card itself lifts away, so the
        // footage lags the frame rather than moving locked to it.
        .fromTo(
          ".hero-plate",
          { y: 0 },
          { y: () => root.clientHeight * PLATE_PARALLAX_RATIO, ease: "none" },
          0,
        )
        .to("[data-hero-scrim]", { opacity: 0.35, ease: "none" }, 0);

      // The bottom radius is driven here rather than tweened, and quantised to
      // 4px steps. `border-radius` is a paint property: every distinct value
      // re-rasterizes the card's layer, and that layer is a full-viewport box
      // wrapping a playing video — so tweening it continuously meant a full
      // repaint on every single frame of the scrub, which is what was left of
      // the stutter. Stepping it drops that from ~60 repaints to ~11 across the
      // whole handoff; a 4px difference in corner radius on a moving card is
      // below the threshold where anyone can see the stepping, so the corners
      // still read as easing in. Everything else in this timeline is now
      // transform- or opacity-only, i.e. compositor work.
      if (cardEl) {
        let lastRadius = -1;
        exitTl.eventCallback("onUpdate", () => {
          const stepped =
            Math.round((exitTl.progress() * CARD_SHRINK_RADIUS) / RADIUS_STEP_PX) *
            RADIUS_STEP_PX;
          if (stepped === lastRadius) return;
          lastRadius = stepped;
          cardEl.style.setProperty("--hero-card-radius", `${stepped}px`);
        });
      }
    }, stage || root);

    return () => {
      ctx.revert();
      // Set outside GSAP's bookkeeping, so `revert()` will not clear it.
      cardEl?.style.removeProperty("--hero-card-radius");
    };
  }, [reduce]);

  return (
    <section
      ref={rootRef}
      id="atas"
      className="hero-container sm-tone-dark"
      aria-label={t("posterAlt")}
    >
      {/* Hero Visual Card (Wraps plate + content, animated on scroll to shrink together) */}
      <div className="hero-card">
        {/* Background Plate: Looping Altar Footage */}
        <div className="hero-plate">
          <Image
            src={VIDEO_POSTER}
            alt={t("posterAlt")}
            fill
            priority
            sizes="100vw"
            quality={82}
            className="hero-bg-img"
          />
          <video
            ref={bgVideoRef}
            className="hero-bg-video"
            data-ready={bgVideoReady || undefined}
            poster={VIDEO_POSTER}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="hero-directional-overlay" aria-hidden="true" />
          <div className="hero-scrim" data-hero-scrim aria-hidden="true" />
        </div>

        {/* Main Hero Content Stage (Row 1: Title + Navlinks; Row 2: Subtitle + Portal Action) */}
        <div className="hero-stage-content sm-shell">
          {/* Row 1: Big Headline + 4 Nav Links */}
          <div className="hero-stage-row hero-stage-row-title">
            <h1 className="hero-display-headline">
              <span className="hero-headline-line-mask">
                <span className="hero-headline-line" data-hero-line>
                  {t("headlineA")}
                </span>
              </span>
              <span className="hero-headline-line-mask">
                <span className="hero-headline-line" data-hero-line>
                  {t("headlineB")}
                </span>
              </span>
            </h1>

            <nav
              id="hero-nav-primary"
              aria-label={tNav("navLabel")}
              className="hero-stage-nav-primary"
            >
              <a
                href={`/#ibadah`}
                onClick={onAnchor("ibadah")}
                className="hero-nav-anchor"
                data-hero-nav-item
              >
                {t("navIbadah")}
              </a>
              <a
                href={`/#cerita`}
                onClick={onAnchor("cerita")}
                className="hero-nav-anchor"
                data-hero-nav-item
              >
                {t("navCerita")}
              </a>
              <a
                href={`/#kunjungan-pertama`}
                onClick={onAnchor("kunjungan-pertama")}
                className="hero-nav-anchor"
                data-hero-nav-item
              >
                {t("navKunjungan")}
              </a>
              <a
                href={`/#persembahan`}
                onClick={onAnchor("persembahan")}
                className="hero-nav-anchor"
                data-hero-nav-item
              >
                {t("navPersembahan")}
              </a>
            </nav>
          </div>

          {/* Row 2: Subtitle + Portal Jemaat Button */}
          <div className="hero-stage-row hero-stage-row-sub">
            <p className="hero-display-subtitle" data-hero-fade>
              {t("subtitleA")}{" "}
              <br className="hidden sm:inline" />
              {t("subtitleB")}
            </p>

            <div className="hero-stage-portal-action">
              <Link
                href="/auth/member"
                className="hero-portal-btn group"
                data-hero-fade
              >
                <span>{tNav("portal")}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
