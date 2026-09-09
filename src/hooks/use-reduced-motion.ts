"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the visitor has asked for reduced motion.
 *
 * Read through `useSyncExternalStore` rather than `useEffect` + state so the
 * very first client render already knows the answer. With an effect, a
 * reduced-motion visitor renders one frame of the animated tree before the
 * effect flips it — which on this page means a pinned section mounting and
 * immediately tearing down, and the scroll position jumping as its spacer
 * disappears.
 */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}
