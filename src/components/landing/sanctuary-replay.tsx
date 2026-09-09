"use client";

import * as React from "react";
import gsap from "gsap";
import Image from "next/image";
import { Flip } from "gsap/Flip";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

import { Sheet } from "./sheet";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const REPLAY = "/landing-page/sanctuary-replay.mp4";

/**
 * The playback drawer, opened as a container transform.
 *
 * GSAP Flip is doing something a CSS transition cannot: the thumbnail and the
 * dialog panel are different elements in different stacking contexts (the
 * dialog lives in the browser's top layer), so there is no shared ancestor to
 * transition. Flip measures the thumbnail's real screen rect, snaps the panel
 * onto it, and animates the panel back to its natural geometry — which reads
 * as the thumbnail growing into the player rather than a modal appearing over
 * it.
 */
export function SanctuaryReplay() {
  const t = useTranslations("lp.sermon");
  const reduce = useReducedMotion();

  const [open, setOpen] = React.useState(false);
  const thumbRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!open || reduce) return;
    gsap.registerPlugin(Flip);
    const panel = panelRef.current;
    const thumb = thumbRef.current;
    if (!panel || !thumb) return;

    // One frame of delay: the dialog has to be in the top layer and laid out
    // before its natural geometry can be recorded.
    const id = requestAnimationFrame(() => {
      const natural = Flip.getState(panel);
      Flip.fit(panel, thumb, { scale: true });
      Flip.to(natural, {
        duration: 0.78,
        ease: "power3.inOut",
        scale: true,
        onComplete: () => gsap.set(panel, { clearProps: "transform" }),
      });
    });
    return () => cancelAnimationFrame(id);
  }, [open, reduce]);

  // Autoplay only once the drawer is open — a video that starts on page load
  // with sound is the single rudest thing a church website can do.
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (open) void el.play().catch(() => {});
    else {
      el.pause();
      el.currentTime = 0;
    }
  }, [open]);

  return (
    <>
      <button
        ref={thumbRef}
        type="button"
        onClick={() => setOpen(true)}
        className="sm-replay-thumb sm-figure sm-figure-shade"
        aria-label={t("watch")}
      >
        <Image
          src="/landing-page/hero-poster.jpg"
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 62rem) 90vw, 42vw"
          quality={76}
        />
        <span className="sm-replay-badge">
          <span className="sm-replay-icon">
            <Play className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="sm-action">{t("watch")}</span>
        </span>
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("closeVideo")}
        variant="center"
        labelledBy="sm-replay-title"
      >
        <div ref={panelRef} className="sm-replay-stage">
          <video
            ref={videoRef}
            src={REPLAY}
            className="sm-replay-video"
            controls
            playsInline
            preload="none"
            poster="/landing-page/hero-poster.jpg"
          />
          <div className="sm-replay-caption">
            <h3 id="sm-replay-title" className="sm-h4">
              {t("watchTitle")}
            </h3>
            <p className="sm-small" style={{ color: "var(--sm-ink-2)" }}>
              {t("watchBody")}
            </p>
          </div>
        </div>
      </Sheet>
    </>
  );
}
