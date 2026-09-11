"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { NextService } from "@/config/campus";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Resolved = {
  key: string;
  start: number;
  end: number;
  live: boolean;
};

/**
 * Rolls each slot forward by whole weeks until it has not finished yet, then
 * returns the one happening now, or failing that the soonest.
 *
 * Whole weeks are exact arithmetic here: Jakarta is UTC+7 year-round with no
 * DST, so a weekly service is always 604_800_000 ms apart. That is what lets
 * this run on the client with no timezone library at all — the server did the
 * only calendar-aware part when it resolved the first occurrence.
 */
export function resolveNow(slots: readonly NextService[], now: number): Resolved {
  const rolled = slots.map((s) => {
    let start = Date.parse(s.startsAtIso);
    let end = Date.parse(s.endsAtIso);
    while (end <= now) {
      start += WEEK_MS;
      end += WEEK_MS;
    }
    return { key: s.slotKey, start, end, live: start <= now };
  });
  rolled.sort((a, b) => a.start - b.start);
  return rolled.find((r) => r.live) ?? rolled[0];
}

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown to the next gathering.
 *
 * Server-rendered with real digits rather than placeholders: the hero has to
 * be fully resolved on arrival, and a dash that becomes a number after
 * hydration is exactly the "not quite finished" feeling the page is trying to
 * avoid. The server and the client can differ by the request latency, so the
 * digits carry `suppressHydrationWarning` — the alternative, rendering nothing
 * until mounted, is worse.
 */
export function ServiceCountdown({
  slots,
  serviceNames,
}: {
  slots: readonly NextService[];
  serviceNames: Record<string, string>;
}) {
  const t = useTranslations("lp.countdown");
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    // Aligned to the wall-clock second so the seconds digit does not appear to
    // stutter or skip, which it does with a naive 1000ms interval.
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(timer);
  }, []);

  const resolved = resolveNow(slots, now);
  const name = serviceNames[resolved.key] ?? "";

  if (resolved.live) {
    return (
      <div className="flex flex-col gap-2.5">
        {/* The material role, not the interactive one: this is a status, and
            in the interactive blue it reads as something you can click. */}
        <p className="sm-label" style={{ color: "var(--sm-accent-display)" }}>
          {t("live")}
        </p>
        <p className="sm-h4">{name}</p>
      </div>
    );
  }

  const { d, h, m, s } = parts(resolved.start - now);

  return (
    <div className="flex flex-col gap-3">
      <p className="sm-label sm-eyebrow">
        {t("next")}
        <span aria-hidden> · </span>
        <span style={{ color: "var(--sm-fg)" }}>{name}</span>
      </p>
      <dl className="sm-countdown" suppressHydrationWarning>
        <Unit value={d} label={t("days")} />
        <Sep />
        <Unit value={h} label={t("hours")} pad />
        <Sep />
        <Unit value={m} label={t("minutes")} pad />
        <Sep />
        <Unit value={s} label={t("seconds")} pad />
      </dl>
    </div>
  );
}

function Unit({
  value,
  label,
  pad: doPad = false,
}: {
  value: number;
  label: string;
  pad?: boolean;
}) {
  return (
    <div className="sm-countdown-unit">
      <dd className="sm-num" suppressHydrationWarning>
        {doPad ? pad(value) : value}
      </dd>
      <dt className="sm-label sm-eyebrow">{label}</dt>
    </div>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="sm-num sm-countdown-sep"
      style={{ color: "var(--sm-fg-faint)", opacity: 0.5 }}
    >
      /
    </span>
  );
}
