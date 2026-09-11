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
const MENGAPA_LIFT_VH = 0.2;

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
    const mengapaEl =
      (stage ? stage.querySelector<HTMLElement>("#mengapa") : null) ||
      document.getElementById("mengapa");

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
          scrub: true,
        },
      });
      if (mengapaEl) {
        exitTl.fromTo(
          mengapaEl,
          { y: () => -window.innerHeight * MENGAPA_LIFT_VH },
          { y: 0, ease: "none" },
          0,
        );
      }
      exitTl
        .fromTo(
          root,
          { boxShadow: "0px 32px 80px 12px rgba(0, 0, 0, 0.95)" },
          { boxShadow: "0px 0px 0px 0px rgba(0, 0, 0, 0)", ease: "none" },
          0,
        )
        .to("[data-hero-scrim]", { opacity: 0.35, ease: "none" }, 0);
    }, stage || root);

    return () => ctx.revert();
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
        <div className="hero-stage-content">
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
