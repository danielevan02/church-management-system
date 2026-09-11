"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Play } from "lucide-react";

import { dateFnsLocale, formatJakarta } from "@/lib/datetime";

import { resolveNow } from "./service-countdown";
import { useAnchorNav } from "./scroll-stage";
import { Sheet } from "./sheet";

import type { NextService } from "@/config/campus";

const CARD_WOMAN = "/landing-page/hero-card-woman.jpg";
const CARD_BIBLE = "/landing-page/hero-card-bible.jpg";
const VIDEO_REPLAY = "/landing-page/sanctuary-replay.mp4";

/** 8-point geometric starburst / asterisk logo mark */
function AsteriskMark({
  className = "w-6 h-6",
  strokeWidth = 1.75,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="3" x2="18" y2="33" strokeLinecap="round" />
      <line x1="3" y1="18" x2="33" y2="18" strokeLinecap="round" />
      <line x1="7.39" y1="7.39" x2="28.61" y2="28.61" strokeLinecap="round" />
      <line x1="7.39" y1="28.61" x2="28.61" y2="7.39" strokeLinecap="round" />
    </svg>
  );
}

type NaveFeatureGridProps = {
  slots?: readonly NextService[];
};

export function NaveFeatureGrid({ slots }: NaveFeatureGridProps) {
  const t = useTranslations("lp.hero");
  const onAnchor = useAnchorNav();
  const locale = useLocale();
  const df = dateFnsLocale(locale);

  const [videoOpen, setVideoOpen] = React.useState(false);
  const replayVideoRef = React.useRef<HTMLVideoElement>(null);

  // Replay Video modal playback
  React.useEffect(() => {
    const el = replayVideoRef.current;
    if (!el) return;
    if (videoOpen) {
      void el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [videoOpen]);

  // `slots` is resolved once at build time, so its ISO instants are only
  // ever correct on the day the page was generated — this page is fully
  // static, with no `revalidate`. Re-resolving against the client's own
  // clock on mount (the same trick `ServiceCountdown` uses) is what keeps
  // the displayed date from quietly going stale a week after deploy.
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  // Formatted next service time
  const formattedServiceTime = React.useMemo(() => {
    if (!slots || slots.length === 0) return null;
    const next = resolveNow(slots, now);
    const dateStr = formatJakarta(new Date(next.start), "d MMM", df);
    const startHour = formatJakarta(new Date(next.start), "HH:mm", df);
    const endHour = formatJakarta(new Date(next.end), "HH:mm", df);
    return `${dateStr}, ${startHour} - ${endHour} WIB`;
  }, [slots, now, df]);

  return (
    <>
      <div
        className="hero-bottom-grid nave-feature-grid"
        role="group"
        aria-label={t("highlightsLabel")}
      >
        {/* Card 1: Woman holding open Bible */}
        <div className="hero-box hero-box-photo">
          <Image
            src={CARD_WOMAN}
            alt={t("photoAlt")}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover"
          />
        </div>

        {/* Card 2: Deep Black Quote Box */}
        <div className="hero-box hero-box-quote">
          <div className="hero-quote-glyph" aria-hidden="true">
            “
          </div>
          <p className="hero-quote-body">{t("quote")}</p>
        </div>

        {/* Card 3: Hands on Bibles with Interactive Play Button */}
        <button
          type="button"
          className="hero-box hero-box-video group cursor-pointer"
          onClick={() => setVideoOpen(true)}
          aria-label={t("watch")}
        >
          <Image
            src={CARD_BIBLE}
            alt={t("videoAlt")}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="hero-video-tint group-hover:opacity-40 transition-opacity" />
          <div className="hero-play-button group-hover:scale-110 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
          </div>
        </button>

        {/* Card 4: Clean White Sunday Worship Service Card */}
        <div className="hero-box hero-box-service">
          <div className="hero-service-top">
            <h2 className="hero-service-heading">{t("serviceTitle")}</h2>
            <p className="hero-service-schedule">
              {formattedServiceTime || t("serviceTime")}
            </p>
          </div>

          <div className="hero-service-bottom">
            <a
              href={`/#ibadah`}
              onClick={onAnchor("ibadah")}
              className="hero-service-cta group inline-flex items-center gap-1.5"
            >
              <span className="hero-service-cta-text">{t("learnMore")}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="hero-service-logo text-neutral-900">
              <AsteriskMark className="w-9 h-9" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Video Replay Modal Sheet */}
      <Sheet
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title={t("closeVideo")}
        variant="center"
        labelledBy="sm-replay-title"
      >
        <div className="sm-replay-stage">
          <video
            ref={replayVideoRef}
            src={VIDEO_REPLAY}
            className="sm-replay-video"
            controls
            playsInline
            preload="none"
            poster={CARD_BIBLE}
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
