"use client";

import * as React from "react";

import { usePathname } from "@/lib/i18n/navigation";
import { pickTransitionPattern } from "@/lib/transition-pattern";
import { cn } from "@/lib/utils";

/**
 * Applies M3's navigation transition patterns on route change.
 *
 * M3 picks a pattern from the *relationship* between the two screens, not from
 * taste. This infers that relationship from the route depth, which is the only
 * signal available without annotating every link:
 *
 *   deeper path   -> shared axis, forward   (/admin/members -> /admin/members/x)
 *   shallower     -> shared axis, backward  (detail -> list, or a back press)
 *   sibling       -> fade through           (dashboard -> giving, no relation)
 *
 * Keyed on pathname, so the subtree remounts and the enter animation plays.
 * Search-param changes deliberately do not remount — a filter or a page number
 * is not a navigation, and animating it would make table filtering feel slow.
 *
 * ## What this is not
 *
 * Only the *incoming* half. M3's fade-through is sequential — the outgoing
 * screen fades over the first ~30% of the duration — but React unmounts the
 * old tree before the new one commits. Holding it would mean intercepting
 * every navigation and delaying it ~90ms, which trades real latency on every
 * tap for a fade nobody asked for.
 *
 * The correct fix is the View Transitions API driven by the router, i.e.
 * Next's `experimental.viewTransition`. That flag exists in this Next version
 * but requires the React *experimental* channel (`unstable_ViewTransition` is
 * not in react 19.1.0 stable), which is not a dependency change to make
 * casually in a production app. See docs/design-system.md.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const previous = React.useRef<string | null>(null);

  // The choice itself lives in @/lib/transition-pattern so it can be unit
  // tested without a DOM.
  const pattern = pickTransitionPattern(previous.current, pathname);

  // Ref, not state: this only needs to be right for the next render, and
  // writing it during render keeps the animation and the commit in the same
  // frame. There is no first-load animation — nothing navigated to get here.
  React.useEffect(() => {
    previous.current = pathname;
  }, [pathname]);

  return (
    <div key={pathname} className={cn(pattern, className)}>
      {children}
    </div>
  );
}
