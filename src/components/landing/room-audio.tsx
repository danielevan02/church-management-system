"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";

import { SANCTUARY_DURATION, SANCTUARY_PEAKS } from "./sanctuary-peaks";

const SRC_WEBM = "/landing-page/sanctuary.webm";
const SRC_M4A = "/landing-page/sanctuary.m4a";
const ORDER = ["arrival", "worship", "word", "table", "life"] as const;

const clock = (s: number) => {
  const total = Math.max(0, Math.floor(s));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * The sanctuary's own room tone, with a waveform scrubber and an order of
 * service that advances with playback.
 *
 * What this is *not*: a transcript. The only audio in this project is ten
 * seconds of ambience from the supplied footage, so pairing it with invented
 * spoken words would be a fabrication. Instead the kinetic text is the real
 * order of service, and the copy asks the visitor to read along while the room
 * plays — which is an honest use of the asset and a better first-visit aid.
 */
export function RoomAudio() {
  const t = useTranslations("lp.sermon");
  const tl = useTranslations("lp.liturgy");

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const pendingSeekRef = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const rafRef = React.useRef(0);

  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(SANCTUARY_DURATION);
  // Second-resolution only. The bar fill is driven straight onto a CSS
  // variable at frame rate; putting the raw time in React state instead would
  // re-render 128 bars sixty times a second for no visible gain.
  const [second, setSecond] = React.useState(0);

  const paint = React.useCallback(
    (time: number, total: number) => {
      const pct = total > 0 ? Math.min(100, (time / total) * 100) : 0;
      trackRef.current?.style.setProperty("--sm-progress", `${pct}%`);
      setSecond(Math.floor(time));
      if (rangeRef.current && document.activeElement !== rangeRef.current) {
        rangeRef.current.value = String(time);
      }
    },
    [],
  );

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
      }
      if (pendingSeekRef.current !== null) {
        el.currentTime = Math.min(pendingSeekRef.current, el.duration || 0);
        pendingSeekRef.current = null;
      }
    };
    const onEnd = () => {
      setPlaying(false);
      paint(0, el.duration || SANCTUARY_DURATION);
    };
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [paint]);

  React.useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    // `timeupdate` fires roughly four times a second, which on a waveform
    // reads as a stutter; rAF is what makes the fill look continuous.
    const loop = () => {
      const el = audioRef.current;
      if (el) paint(el.currentTime, el.duration || duration);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, duration, paint]);

  const toggle = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const restart = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    paint(0, el.duration || duration);
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => {});
  }, [duration, paint]);

  /**
   * Scrubbing before the file has metadata.
   *
   * `preload="metadata"` is lazy, so a visitor who drags the waveform before
   * ever pressing play hits an element with `readyState === 0`, where assigning
   * `currentTime` is simply discarded. The bar moved, the clock moved, and then
   * playback started from zero. Holding the request and applying it once
   * metadata lands makes the control mean what it shows.
   */
  const seek = React.useCallback(
    (value: number) => {
      const el = audioRef.current;
      if (!el) return;
      if (el.readyState === 0) {
        pendingSeekRef.current = value;
        el.load();
      } else {
        el.currentTime = value;
      }
      paint(value, el.duration || duration);
    },
    [duration, paint],
  );

  const activeIndex = Math.min(
    ORDER.length - 1,
    Math.floor((second / Math.max(duration, 0.001)) * ORDER.length),
  );

  return (
    <div className="sm-audio">
      {/* Two encodings, WebM/Opus first. AAC in an MP4 container is not
          universally decodable — it is absent from Chromium builds without
          proprietary codecs and from some Firefox packages — and this is the
          one asset on the page with no visual fallback if it fails. Multiple
          `<source>` children are honoured reliably on `<audio>`, unlike the
          `media` attribute on `<video>` sources. */}
      <audio ref={audioRef} preload="metadata">
        <source src={SRC_WEBM} type="audio/webm" />
        <source src={SRC_M4A} type="audio/mp4" />
      </audio>

      <div className="sm-audio-deck">
        <button
          type="button"
          onClick={toggle}
          className="sm-audio-play"
          aria-label={playing ? t("pause") : t("play")}
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div ref={trackRef} className="sm-audio-track">
          <Wave className="sm-audio-wave-base" />
          <Wave className="sm-audio-wave-fill" />
          {/* A real range input, visually merged with the bars. It carries the
              keyboard and screen-reader contract that a click-handled div
              cannot, and it is why the waveform is genuinely operable. */}
          <input
            ref={rangeRef}
            type="range"
            min={0}
            max={duration}
            step={0.01}
            defaultValue={0}
            onChange={(e) => seek(Number(e.target.value))}
            className="sm-audio-range"
            aria-label={t("seek")}
            aria-valuetext={`${clock(second)} / ${clock(duration)}`}
          />
        </div>

        <p className="sm-num-sm sm-audio-time" aria-hidden>
          {clock(second)}
          <span className="sm-audio-time-sep"> / </span>
          {clock(duration)}
        </p>

        <button
          type="button"
          onClick={restart}
          className="sm-audio-icon"
          aria-label={t("restart")}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <p className="sm-small sm-audio-note">{t("note")}</p>

      <div className="sm-audio-order">
        <p className="sm-label sm-eyebrow">{t("orderLabel")}</p>
        <ol className="sm-order-list">
          {ORDER.map((k, i) => (
            <li
              key={k}
              data-active={i === activeIndex || undefined}
              className="sm-order-item"
            >
              <span className="sm-label sm-order-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sm-order-name sm-h4">
                {tl(`chapters.${k}.title`)}
              </span>
              <span className="sm-small sm-order-when">
                {tl(`chapters.${k}.when`)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const STEP = 3;
const BAR = 1.7;
const VB_W = SANCTUARY_PEAKS.length * STEP;

/**
 * One row of amplitude bars, drawn as a stretched SVG.
 *
 * The first version laid out 128 flex children per row with `min-width: 1px`
 * and a 2px gap, which gives the row a min-content width of 382px — it could
 * not compress into a 350px phone column, and it was the entire reason the
 * document scrolled 85px sideways on a 390px viewport. A `viewBox` with
 * `preserveAspectRatio="none"` has no minimum width at all: it scales to
 * whatever column it is given, from 120px to 800px, and it halves the node
 * count in the process (this is rendered twice and stacked, so that was 256
 * spans).
 */
function Wave({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} 100`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {SANCTUARY_PEAKS.map((p, i) => {
        const h = Math.max(1.5, p * 100);
        return (
          <rect
            key={i}
            x={i * STEP + (STEP - BAR) / 2}
            y={(100 - h) / 2}
            width={BAR}
            height={h}
          />
        );
      })}
    </svg>
  );
}
