"use client";

import { ReactLenis, useLenis } from "lenis/react";
import * as React from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Smooth-scroll + ScrollTrigger stage for the landing page.
 *
 * `ReactLenis root` renders no element of its own — it attaches to the window
 * and publishes the instance through a store — so wrapping the page in this
 * adds nothing to the DOM and cannot break the pin spacers ScrollTrigger
 * inserts.
 *
 * Under `prefers-reduced-motion` Lenis stays mounted but stops smoothing:
 * scrolling reverts to the browser's own, while `scroll` events keep flowing
 * to ScrollTrigger so scroll-linked *positions* still resolve. Unmounting it
 * instead would remount the whole subtree the moment the query changed.
 */
export function ScrollStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        // Long, near-linear glide: the page's motion metaphor is light moving
        // across stone, and Lenis' punchier defaults fight that.
        lerp: reduce ? 1 : 0.085,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.6,
        smoothWheel: !reduce,
        syncTouch: false,
      }}
    >
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}

/**
 * Hands scroll control to GSAP.
 *
 * Lenis and ScrollTrigger both want to own a rAF loop, and letting them run
 * separate loops is what produces the classic one-frame lag between a pinned
 * element and its content. Driving `lenis.raf` from `gsap.ticker` puts both on
 * the same clock; `lagSmoothing(0)` stops GSAP from "catching up" after a
 * dropped frame, which on a pinned timeline reads as a jump.
 */
function ScrollTriggerBridge() {
  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers fire a resize when the URL bar collapses. Without this,
    // every pin recalculates mid-scroll and the page visibly shifts.
    ScrollTrigger.config({ ignoreMobileResize: true });
  }, []);

  const lenis = useLenis(() => ScrollTrigger.update());

  React.useEffect(() => {
    if (!lenis) return;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Pins measure their own height; fonts land after first paint and change
    // it, so a refresh once the webfonts are in place avoids stale offsets.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

/**
 * The Lenis-eased jump to an in-page anchor, shared by every in-page nav
 * control on the landing page (the hero's row of section links, the "Pelajari
 * Lebih Lanjut" card, and the condensed nav bar). A plain `href="#id"` would
 * hard-jump and desynchronise every pinned timeline on the way past.
 *
 * Returns whether it found the target and actually scrolled, so callers can
 * decide whether to swallow the click (`preventDefault`) or let a real anchor
 * navigate normally — which matters when the id lives on another route.
 */
export function scrollToId(
  id: string,
  lenis: ReturnType<typeof useLenis>,
  reduce: boolean,
): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis && !reduce) {
    const navOffset = Math.round(
      parseFloat(window.getComputedStyle(el).scrollMarginTop) || 72,
    );
    lenis.start();
    lenis.scrollTo(el, { duration: 1.4, force: true, offset: -navOffset });
  } else {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  return true;
}

/**
 * Click handler factory for a real `<a href="/#id">` section link.
 *
 * Real anchors, not buttons: a button has no `href`, so it offers no
 * middle-click, no "open in new tab", and nothing for a crawler to follow.
 * Returning false from a modified click lets the browser handle it normally;
 * everything else glides there through Lenis instead of hard-jumping.
 */
export function useAnchorNav() {
  const lenis = useLenis();
  const reduce = useReducedMotion();

  return React.useCallback(
    (id: string) => (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      if (scrollToId(id, lenis, reduce)) e.preventDefault();
    },
    [lenis, reduce],
  );
}
