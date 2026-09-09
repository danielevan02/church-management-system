"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/lib/i18n/navigation";

/**
 * Show nothing at all for a navigation that resolves faster than this.
 *
 * This single number is the whole point of the rewrite. The previous version
 * put a full-screen frosted backdrop and a branded modal card on screen at
 * 0ms on every internal link click, which meant an 80ms client-side route
 * change — the overwhelming majority of them — flashed a splash screen and
 * took it away again. That does not communicate "loading". It communicates
 * that the app is struggling, on every single click, and it made the app feel
 * markedly slower than it is.
 *
 * 180ms is roughly the threshold below which a person reads a transition as
 * instantaneous. Below it, feedback is not just unnecessary, it is noise.
 */
const SHOW_AFTER_MS = 180;

/**
 * Once the bar *has* appeared, keep it for at least this long.
 *
 * Without a floor, a navigation that lands at 190ms shows a bar for 10ms —
 * a flicker, which reads as a rendering fault rather than as progress.
 */
const MIN_VISIBLE_MS = 320;

/** Give up and clear the bar if a navigation never completes. */
const SAFETY_MS = 8000;

/**
 * Imperative hooks for navigation that does not go through an `<a href>` —
 * `LoadingLink` pushes the route from a `<button>`, and the delegated click
 * listener below can only see anchors.
 */
export function triggerNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:navigation-start"));
  }
}

export function triggerNavigationStop() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:navigation-stop"));
  }
}

/**
 * The global navigation indicator: one 2px bar across the top of the viewport,
 * and only when a route change is actually slow.
 *
 * **What it deliberately no longer does.** It does not cover the page. The app
 * ships 89 `loading.tsx` skeletons for 94 routes — a real, per-route loading
 * design, already built — and the old overlay drew a `backdrop-blur` over the
 * top of every one of them. The skeletons were never visible to anybody. The
 * correct division of labour is: this bar says *a navigation is in flight*,
 * and the destination's own skeleton says *what is arriving*. A global overlay
 * can only get in the way of the second job.
 *
 * It also no longer shows the church name and logo. A brand card belongs to a
 * cold start, once; showing it on every route change turns the church's
 * identity into a loading spinner.
 */
export function NavigationProgress() {
  const t = useTranslations("common");
  const pathname = usePathname();

  const [visible, setVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // All timers in one bag so every exit path can clear all of them.
  const timers = React.useRef<{
    show?: ReturnType<typeof setTimeout>;
    trickle?: ReturnType<typeof setInterval>;
    safety?: ReturnType<typeof setTimeout>;
    hide?: ReturnType<typeof setTimeout>;
  }>({});
  const shownAt = React.useRef<number>(0);
  const running = React.useRef(false);

  /**
   * Path + query of the last settled navigation, used to tell a real history
   * move from a same-document one. `window.location` rather than `pathname`
   * because next-intl strips the locale prefix, and this has to compare
   * against what `popstate` will report.
   */
  const settledAt = React.useRef("");

  const clearTimers = React.useCallback(() => {
    const t = timers.current;
    if (t.show) clearTimeout(t.show);
    if (t.trickle) clearInterval(t.trickle);
    if (t.safety) clearTimeout(t.safety);
    if (t.hide) clearTimeout(t.hide);
    timers.current = {};
  }, []);

  const stop = React.useCallback(() => {
    if (!running.current) return;
    running.current = false;

    const wasVisible = shownAt.current > 0;
    clearTimers();

    // Never appeared: the navigation beat the threshold, so there is nothing
    // to tidy up and — the whole point — the user saw no loading state.
    if (!wasVisible) {
      setProgress(0);
      return;
    }

    setProgress(100);
    const heldFor = Date.now() - shownAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - heldFor);
    timers.current.hide = setTimeout(() => {
      setVisible(false);
      shownAt.current = 0;
      // Reset only after the fade-out has finished, so the bar does not snap
      // back to zero width while it is still on screen.
      timers.current.hide = setTimeout(() => setProgress(0), 240);
    }, wait);
  }, [clearTimers]);

  const start = React.useCallback(() => {
    if (running.current) return;
    running.current = true;
    clearTimers();
    shownAt.current = 0;
    setProgress(0);

    timers.current.show = setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(true);
      setProgress(12);

      /*
       * An asymptotic crawl toward 90% rather than random jumps. The bar has
       * no idea how long the navigation will take, so it must never reach the
       * end on its own — it decelerates, which reads as "still working"
       * instead of as "about to finish" followed by a stall.
       */
      timers.current.trickle = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.12));
      }, 110);
    }, SHOW_AFTER_MS);

    timers.current.safety = setTimeout(stop, SAFETY_MS);
  }, [clearTimers, stop]);

  // A committed route change ends the wait. For any route with a loading.tsx
  // this fires when the skeleton mounts, which is exactly right: the skeleton
  // takes over from here. Runs on mount too, which seeds `settledAt`.
  React.useEffect(() => {
    settledAt.current = window.location.pathname + window.location.search;
    stop();
  }, [pathname, stop]);

  React.useEffect(() => clearTimers, [clearTimers]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0 ||
        e.defaultPrevented
      ) {
        return;
      }

      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;

      if (
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      try {
        const next = new URL(a.href, window.location.href);
        const here = new URL(window.location.href);
        if (next.origin !== here.origin) return;
        // Same page, or a jump to an anchor on it — no navigation to report.
        if (next.pathname === here.pathname && next.search === here.search) {
          return;
        }
        start();
      } catch {
        // Unparseable href; let the browser deal with it.
      }
    };

    /**
     * A history move only deserves the bar if the *document* is changing.
     *
     * Clicking an in-page anchor on the landing page fires `popstate` under
     * the App Router — the click handler above correctly ignores `#jadwal`,
     * and then the browser fired popstate a tick later and started the bar
     * anyway. So every nav link on the landing page drew a loading bar for a
     * navigation that made no request at all (confirmed: zero RSC fetches).
     *
     * Comparing path and query catches it: a hash-only move leaves both
     * unchanged, while a genuine back or forward changes at least one.
     */
    const onPop = () => {
      const now = window.location.pathname + window.location.search;
      if (now === settledAt.current) return;
      start();
    };
    const onStart = () => start();
    const onStop = () => stop();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPop);
    window.addEventListener("app:navigation-start", onStart);
    window.addEventListener("app:navigation-stop", onStop);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("app:navigation-start", onStart);
      window.removeEventListener("app:navigation-stop", onStop);
    };
  }, [start, stop]);

  return (
    <>
      {/*
        No track behind the bar. A permanently visible rail is a piece of
        furniture the page has to carry at all times to serve the fraction of
        a second when something is loading; without it the indicator simply is
        not there until it is needed.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.5"
      >
        <div
          className="h-full origin-left bg-brand-progress shadow-[0_0_10px_0] shadow-brand-progress/60 transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
        />
      </div>

      {/*
        Screen readers get the announcement the old modal used to carry — the
        bar itself is decorative to them, and a page-covering dialog was never
        the right way to say "one moment".
      */}
      <div role="status" aria-live="polite" className="sr-only">
        {visible ? t("loading") : ""}
      </div>
    </>
  );
}
