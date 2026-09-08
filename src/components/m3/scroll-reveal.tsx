"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends React.ComponentProps<"div"> {
  delay?: number;
  staggerIndex?: number;
  direction?: "up";
  threshold?: number;
  once?: boolean;
}

/**
 * M3 ScrollReveal Component
 *
 * Smoothly reveals content as it enters the viewport, sliding up from bottom to top
 * with Material 3 Decelerated spring physics ("muncul dari bawah ke atas").
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  staggerIndex,
  direction = "up",
  threshold = 0.1,
  once = true,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setRevealed(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  const calculatedDelay =
    staggerIndex !== undefined ? (staggerIndex + 1) * 60 : delay;

  return (
    <div
      ref={ref}
      data-reveal={direction}
      data-revealed={revealed ? "true" : undefined}
      style={{
        ...style,
        transitionDelay:
          revealed && calculatedDelay > 0 ? `${calculatedDelay}ms` : undefined,
      }}
      className={cn("m3-scroll-reveal", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ScrollRevealGroup
 *
 * Automatically assigns ascending stagger delays to each child component
 * so they ripple into the viewport sequentially.
 */
export function ScrollRevealGroup({
  children,
  className,
  staggerMs = 60,
  ...props
}: React.ComponentProps<"div"> & { staggerMs?: number }) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("m3-stagger-group", className)} {...props}>
      {childrenArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return (
            <ScrollReveal
              key={child.key ?? index}
              delay={index * staggerMs}
            >
              {child}
            </ScrollReveal>
          );
        }
        return child;
      })}
    </div>
  );
}

export interface StaggerGroupProps extends React.ComponentProps<"div"> {
  variant?: "cards" | "items" | "rows" | "sections";
}

/**
 * StaggerGroup
 *
 * Reusable container that triggers progressive stagger animations on its direct children
 * as soon as it enters the viewport ("muncul berurutan dari bawah ke atas").
 */
export function StaggerGroup({
  children,
  className,
  variant = "cards",
  ...props
}: StaggerGroupProps) {
  return (
    <div
      suppressHydrationWarning
      data-stagger={variant}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Global ScrollRevealProvider
 *
 * Observes every element marked `[data-reveal]` or `[data-stagger]` across all
 * pages and stamps `data-revealed="true"` on it once it enters the viewport,
 * which is what the CSS in `transitions.css` keys the entrance animation off.
 *
 * Three things about this are deliberate, and the first is the one that bites:
 *
 * **It writes an attribute React does not render, so every target needs
 * `suppressHydrationWarning`.** The attribute never appears in the SSR HTML —
 * it cannot, the server never runs this — so when React hydrates an element
 * this has already stamped, it finds an attribute it did not render and reports
 * "some attributes of the server rendered HTML didn't match". The race is real
 * and not theoretical: a page under a `Suspense`/`LoadingBoundary` hydrates
 * *after* this provider's effect has run, and the `MutationObserver` below fires
 * on React's own hydration mutations, so it stamps elements React is in the
 * middle of claiming. Marking the targets is the documented escape hatch for
 * "this element's attributes are managed outside React", and it is the honest
 * description of what happens here. The cure that would remove the need is to
 * let each container own its reveal in React state — which is exactly what
 * `ScrollReveal` above does, and why it is excluded from the selector below.
 *
 * **Work is coalesced into one animation frame.** The previous version called
 * `document.querySelectorAll` from inside the `MutationObserver` callback *and*
 * from a `scroll` listener, so a full-document query ran on every DOM change
 * (React commits included) and on every scroll frame. Now a mutation only
 * schedules a frame, and the scroll listener is gone entirely: entering the
 * viewport is precisely what the `IntersectionObserver` reports, so watching
 * scroll as well was duplicated work.
 *
 * **Discovery and reveal are one frame apart.** An element found in view on the
 * first pass must paint its hidden state before the attribute lands, or the
 * transition has nothing to travel from and the content simply appears. The
 * nested frame is what buys that, and as a side effect it keeps the stamp out of
 * the commit that inserted the node.
 */
export function ScrollRevealProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    // `.m3-scroll-reveal` is absent on purpose: `ScrollReveal` drives its own
    // reveal through React state, and a second writer would fight it.
    const SELECTOR =
      '[data-reveal]:not(.m3-scroll-reveal):not([data-revealed="true"]), ' +
      '[data-stagger]:not([data-revealed="true"])';

    let scheduled = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" },
    );

    const scan = () => {
      scheduled = 0;
      const pending: HTMLElement[] = [];

      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          pending.push(el);
        } else {
          observer.observe(el);
        }
      });

      if (pending.length > 0) {
        requestAnimationFrame(() => {
          pending.forEach((el) => el.setAttribute("data-revealed", "true"));
        });
      }
    };

    const schedule = () => {
      if (scheduled === 0) scheduled = requestAnimationFrame(scan);
    };

    schedule();

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (scheduled !== 0) cancelAnimationFrame(scheduled);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
