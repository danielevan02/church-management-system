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
import { NAV_SECTIONS } from "./landing-nav";

const VIDEO_LG = "/landing-page/hero-loop.mp4";
const VIDEO_SM = "/landing-page/hero-loop-sm.mp4";
const VIDEO_POSTER = "/landing-page/hero-poster.jpg";

/** Scroll distance, in viewport heights, over which the hero recedes.
 *
 *  The reveal itself is NOT on this timeline: the hero is `position: sticky`
 *  and the schedule below it simply scrolls up over it, so the curtain is the
 *  scroll position and nothing else. It finishes covering the hero after
 *  exactly one viewport. This timeline only runs what the hero does WHILE that
 *  happens — shrink, sink, dim — and finishes slightly early so the card has
 *  settled before the last of it is covered rather than still moving. */
const EXIT_TRAVEL_VH = 0.88;
/** What the card scales down to at full recession.
 *
 *  Deliberately shallow. Scaling exposes the stage on all four sides, and past
 *  roughly this much the exposed strip stops reading as depth and starts
 *  reading as a letterboxed video. The rising schedule covers the bottom side
 *  from the first frame, which is what makes the remaining three legible as a
 *  card moving away rather than a layout gap. */
const CARD_SHRINK_SCALE = 0.92;
/** How far the plate drifts down inside the card as the hero recedes — the
 *  parallax lag, so the footage trails its own frame instead of moving locked
 *  to it. As a fraction of hero height; must stay under
 *  `--hero-plate-overhang` in the stylesheet or the plate's top edge shows. */
const PLATE_PARALLAX_RATIO = 0.1;
/** Opacity the scrim and the headline block reach at full recession. The card
 *  is being covered, so it loses light on the way down as well as size. */
const SCRIM_PEAK_OPACITY = 0.5;
const CONTENT_FADE_TO = 0.35;

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

    if (reduce) {
      video.removeAttribute("src");
      video.pause();
      setBgVideoReady(false);
      return;
    }

    const small = window.matchMedia("(max-width: 48rem)").matches;
    video.src = small ? VIDEO_SM : VIDEO_LG;
    video.load();

    const onReady = () => setBgVideoReady(true);
    video.addEventListener("canplay", onReady);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("canplay", onReady);
    };
  }, [reduce]);

  // GSAP Animations: Arrival and Scroll Exit
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;

    const stage = (root.closest(".hero-curtain-stage") as HTMLElement | null) || root.parentElement;

    gsap.registerPlugin(ScrollTrigger);

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

      // 2. RECESSION, scrubbed against the curtain.
      //
      // Nothing here reveals the schedule — the hero is `position: sticky` and
      // the schedule is the next box in flow with a higher z-index, so it
      // covers the hero at exactly scroll speed with no tween involved. That
      // is deliberate: a scrubbed reveal lags a fast flick, and the lag is a
      // hole between two surfaces that are supposed to be touching.
      //
      // This timeline is only what the hero does while being covered: the card
      // scales back, the footage sinks inside it, and both the scrim and the
      // headline block lose light. Every property below is transform or
      // opacity, i.e. compositor work — no frame of this scrub repaints the
      // video-bearing layer.
      const exitTl = gsap.timeline({
        scrollTrigger: {
          // The STAGE, not the hero. The hero is sticky, so from any scroll
          // position past the top it reports a rect that has been displaced by
          // its own stickiness — and ScrollTrigger resolves `start` from that
          // rect on every refresh. The stage is in normal flow and shares the
          // hero's top edge, so it measures the same offset and keeps
          // measuring it correctly after a resize.
          trigger: stage || root,
          start: "top top",
          end: () => `+=${window.innerHeight * EXIT_TRAVEL_VH}`,
          // Numeric, not `true`. `scrub: true` pins progress to the raw scroll
          // position, so the animation inherits every irregularity in how the
          // browser dispatches scroll — trackpad and smooth-scroll events do
          // not arrive one per frame, which is what reads as stutter. A number
          // makes GSAP lerp toward the target on rAF instead: one update per
          // painted frame, and the ~0.6s catch-up smooths the gaps.
          scrub: 0.6,
          // The plate drift and the end distance are both measured off the
          // viewport; without this they keep their first-run numbers after a
          // resize or orientation change.
          invalidateOnRefresh: true,
        },
      });
      exitTl
        .to(".hero-card", { scale: CARD_SHRINK_SCALE, ease: "none" }, 0)
        .fromTo(
          ".hero-plate",
          { y: 0 },
          { y: () => root.clientHeight * PLATE_PARALLAX_RATIO, ease: "none" },
          0,
        )
        .to(
          "[data-hero-scrim]",
          { opacity: SCRIM_PEAK_OPACITY, ease: "none" },
          0,
        )
        .to(
          ".hero-stage-content",
          { opacity: CONTENT_FADE_TO, ease: "none" },
          0,
        );

      // 3. The hero is sticky, so it stays in the layout — and its video stays
      // playing — for the whole height of the schedule above it, long after
      // the last pixel of it is visible. Decoding a 1080p loop nobody can see
      // is the one real cost this mechanism adds over the old one, so: stop it
      // once the curtain is closed, start it again on the way back up.
      ScrollTrigger.create({
        trigger: stage || root,
        start: () => `top top-=${window.innerHeight}`,
        end: "max",
        invalidateOnRefresh: true,
        onToggle: (self) => {
          const video = bgVideoRef.current;
          if (!video || !video.src) return;
          if (self.isActive) video.pause();
          else video.play().catch(() => {});
        },
      });

    }, stage || root);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={rootRef}
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
              {NAV_SECTIONS.map((s) => (
                <Link
                  key={s.id}
                  href={`/#${s.id}`}
                  onClick={onAnchor(s.id)}
                  className="hero-nav-anchor"
                  data-hero-nav-item
                >
                  {tNav(s.key)}
                </Link>
              ))}
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
