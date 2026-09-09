"use client";

import * as React from "react";
import gsap from "gsap";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";
import { ArrowDown, MapPin, Volume2, VolumeX } from "lucide-react";

import { ServiceCountdown } from "./service-countdown";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { NextService } from "@/config/campus";

const VIDEO_LG = "/landing-page/hero-loop.mp4";
const VIDEO_SM = "/landing-page/hero-loop-sm.mp4";
const AUDIO_WEBM = "/landing-page/sanctuary.webm";
const AUDIO_M4A = "/landing-page/sanctuary.m4a";

export function HeroSanctuary({
  slots,
  serviceNames,
}: {
  slots: readonly NextService[];
  serviceNames: Record<string, string>;
}) {
  const t = useTranslations("lp.hero");
  const reduce = useReducedMotion();
  const lenis = useLenis();

  const rootRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [videoReady, setVideoReady] = React.useState(false);
  const [audioOn, setAudioOn] = React.useState(false);

  /* --- footage ---------------------------------------------------------- */
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Re-read the query here rather than trusting `reduce`.
    //
    // `useReducedMotion` is a `useSyncExternalStore`, and React uses its
    // *server* snapshot for the hydration render — which is `false`. So this
    // effect ran once believing motion was allowed, attached a source and
    // started playback, and a reduced-motion visitor got autoplaying footage
    // anyway. The media query itself is the only reliable reader at this point.
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      video.removeAttribute("src");
      video.pause();
      setVideoReady(false);
      return;
    }

    // Source chosen here rather than with `<source media>`: that attribute is
    // not honoured for <video> in every engine, and getting it wrong means a
    // 3 MB download on a phone. Without JS no source is set at all and the
    // optimised still underneath is what the visitor sees — which is a
    // deliberate fallback, not a failure state.
    const small = window.matchMedia("(max-width: 48rem)").matches;
    video.src = small ? VIDEO_SM : VIDEO_LG;
    video.load();

    const onReady = () => setVideoReady(true);
    video.addEventListener("loadeddata", onReady);
    const play = video.play();
    if (play) play.catch(() => setVideoReady(false));

    return () => video.removeEventListener("loadeddata", onReady);
  }, [reduce]);

  /* --- ambient room tone ------------------------------------------------ */
  const toggleAudio = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.volume = 0;
      void el.play().then(() => {
        setAudioOn(true);
        // Faded in rather than switched on: the clip is quiet room tone, and a
        // hard start on a page the visitor did not expect to make noise is the
        // one interaction here that could actually startle someone.
        gsap.to(el, { volume: 0.55, duration: 2.2, ease: "power1.out" });
      });
    } else {
      gsap.to(el, {
        volume: 0,
        duration: 0.8,
        ease: "power1.in",
        onComplete: () => {
          el.pause();
          setAudioOn(false);
        },
      });
    }
  }, []);

  /* --- arrival + release ------------------------------------------------ */
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      // Arrival. Runs on load, not on scroll: the first screen has to be
      // fully resolved without the visitor doing anything.
      const lines = SplitText.create("[data-hero-line]", {
        type: "lines",
        mask: "lines",
        aria: "auto",
      });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.set("[data-hero-line]", { opacity: 1 })
        .from(lines.lines, {
          yPercent: 112,
          duration: 1.35,
          stagger: 0.11,
        })
        .from(
          "[data-hero-fade]",
          { opacity: 0, y: 22, duration: 1.05, stagger: 0.09 },
          0.5,
        )
        .from("[data-hero-rule]", { scaleX: 0, duration: 1.2 }, 0.4);

      // Release. Scrubbed, so scrolling back up plays the arrival in reverse
      // rather than replaying a one-shot tween — the hero is symmetric.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        // Type leaves faster than the page scrolls, so the room appears to
        // stay put while the words lift out of it.
        .to("[data-hero-type]", { yPercent: -46, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-rail]", { yPercent: 60, opacity: 0, ease: "none" }, 0)
        // The light "closes" as you leave: the scrim deepens toward obsidian,
        // which is also the colour the next section opens on, so the handoff
        // has no seam and no flash of limestone.
        .to("[data-hero-scrim]", { opacity: 1, ease: "none" }, 0)
        .to("[data-hero-plate]", { scale: 1.14, ease: "none" }, 0);

      return () => lines.revert();
    }, root);

    return () => ctx.revert();
  }, [reduce]);

  const goTo = React.useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis && !reduce) lenis.scrollTo(el, { duration: 1.5 });
      else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    },
    [lenis, reduce],
  );

  return (
    <section
      ref={rootRef}
      id="atas"
      className="sm-hero sm-tone-dark"
      aria-label={t("posterAlt")}
    >
      {/* Plate: the still is the real LCP image — optimised, responsive and
          preloaded — and the footage fades in over it once decoded. */}
      <div className="sm-hero-plate" data-hero-plate>
        <Image
          src="/landing-page/hero-poster.jpg"
          alt={t("posterAlt")}
          fill
          priority
          sizes="100vw"
          quality={82}
          className="sm-hero-still"
        />
        <video
          ref={videoRef}
          className="sm-hero-video"
          data-ready={videoReady || undefined}
          poster="/landing-page/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="sm-hero-grade" aria-hidden />
        <div className="sm-hero-scrim" data-hero-scrim aria-hidden />
      </div>

      <audio ref={audioRef} loop preload="none">
        <source src={AUDIO_WEBM} type="audio/webm" />
        <source src={AUDIO_M4A} type="audio/mp4" />
      </audio>

      <div className="sm-hero-body sm-shell-wide">
        <div className="sm-hero-type" data-hero-type>
          <p className="sm-label sm-hero-eyebrow" data-hero-fade>
            {t("eyebrow")}
          </p>

          <h1 className="sm-display sm-hero-headline">
            <span className="block" data-hero-line>
              {t("headlineA")} {t("headlineB")}
            </span>
            <span className="sm-hero-headline-b sm-em block" data-hero-line>
              {t("headlineC")}
            </span>
          </h1>

          <div className="sm-hero-lower">
            <div className="sm-hero-standfirst">
              <span className="sm-hero-rule" data-hero-rule aria-hidden />
              <p className="sm-lead" data-hero-fade>
                {t("standfirst")}
              </p>
            </div>

            <div className="sm-hero-actions" data-hero-fade>
              <button
                type="button"
                onClick={() => goTo("rencanakan")}
                className="sm-btn sm-btn-primary sm-action"
              >
                {t("cta")}
              </button>
              <button
                type="button"
                onClick={() => goTo("ibadah")}
                className="sm-btn sm-btn-ghost sm-action"
              >
                {t("ctaSecondary")}
              </button>
            </div>
          </div>
        </div>

        {/* Live utility rail. Countdown, place, and the room's own sound —
            everything a first-time visitor needs before scrolling once. */}
        <div className="sm-hero-rail sm-rule-t" data-hero-rail>
          <button
            type="button"
            onClick={() => goTo("mengapa")}
            className="sm-hero-cue sm-label"
          >
            <span className="sm-hero-cue-track" aria-hidden>
              <span className="sm-hero-cue-dot" />
            </span>
            <span className="sm-hero-cue-label">{t("scroll")}</span>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </button>

          <div className="sm-hero-rail-mid">
            <ServiceCountdown slots={slots} serviceNames={serviceNames} />
          </div>

          <div className="sm-hero-rail-end">
            <p className="sm-label sm-eyebrow inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {t("location")}
            </p>
            <button
              type="button"
              onClick={toggleAudio}
              aria-pressed={audioOn}
              className="sm-hero-audio sm-label"
            >
              {audioOn ? (
                <VolumeX className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{audioOn ? t("ambientOff") : t("ambientOn")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
