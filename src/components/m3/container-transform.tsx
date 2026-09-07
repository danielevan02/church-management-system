"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { calculateCenteredTargetRect } from "@/lib/container-transform";
import { cn } from "@/lib/utils";

import type { Rect } from "@/lib/container-transform";

export type ContainerTransformProps = {
  /**
   * The trigger element (e.g. Card, Button, FAB) in its compact state.
   * Receives `open` callback to trigger transformation.
   */
  trigger: (props: {
    open: () => void;
    isOpen: boolean;
    ref: React.RefCallback<HTMLElement>;
  }) => React.ReactNode;

  /**
   * Optional compact content to show inside the surface while it's in flight.
   * If provided, cross-fades into `children` as the container expands.
   */
  triggerContent?: React.ReactNode;

  /**
   * The expanded content surface (e.g. Modal, Details Sheet).
   * Receives `close` callback to reverse transformation.
   */
  children: (props: { close: () => void }) => React.ReactNode;

  /** Optional class name for the expanded container */
  className?: string;

  /** Optional max width in pixels for the expanded container (default 640) */
  maxWidth?: number;

  /** Optional accessible title / label for dialog */
  title?: string;
};

type TransformPhase =
  | "idle"
  | "measuring"
  | "animating-open"
  | "open"
  | "animating-close";

/**
 * Material 3 Container Transform Component
 *
 * Implements M3's authentic container transform pattern:
 * - The original card on the page lifts off and disappears from the grid
 *   (keeping its layout slot intact so neighboring cards don't shift).
 * - A physical container starts with the card's EXACT viewport bounds
 *   and flies directly across the screen to the center.
 * - The bounds (top, left, width, height) and corner radius morph seamlessly
 *   using M3's physics-based spatial spring.
 * - Contents cross-fade smoothly: compact card view fades out, full detail view fades in.
 * - On close, it flies straight back into the card's slot in the grid,
 *   settles down, and the original card reappears.
 */
export function ContainerTransform({
  trigger,
  triggerContent,
  children,
  className,
  maxWidth = 640,
  title,
}: ContainerTransformProps) {
  const [phase, setPhase] = React.useState<TransformPhase>("idle");

  const triggerElRef = React.useRef<HTMLElement | null>(null);
  const surfaceElRef = React.useRef<HTMLDivElement | null>(null);
  const measureElRef = React.useRef<HTMLDivElement | null>(null);
  const originRectRef = React.useRef<Rect | null>(null);
  const targetRectRef = React.useRef<Rect | null>(null);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = React.useSyncExternalStore(
    (notify) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    () => false
  );

  // Clean up any pending close timer on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const setTriggerRef = React.useCallback((node: HTMLElement | null) => {
    triggerElRef.current = node;
  }, []);

  // Open: Hide original card from grid, measure, and initiate flight
  const handleOpen = React.useCallback(() => {
    if (!triggerElRef.current) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const rect = triggerElRef.current.getBoundingClientRect();
    originRectRef.current = {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    setPhase("measuring");
  }, []);

  // Close: Fly back to original card's slot
  const handleClose = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (prefersReducedMotion || !surfaceElRef.current || !triggerElRef.current) {
      if (triggerElRef.current) {
        triggerElRef.current.style.visibility = "visible";
      }
      setPhase("idle");
      triggerElRef.current?.focus();
      return;
    }

    setPhase("animating-close");

    // Re-measure latest trigger position
    const rect = triggerElRef.current.getBoundingClientRect();
    originRectRef.current = {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    const surface = surfaceElRef.current;
    const origin = originRectRef.current;

    // Animate bounds back to card slot
    surface.style.transition = `
      top 220ms var(--md-sys-motion-easing-emphasized-accelerate),
      left 220ms var(--md-sys-motion-easing-emphasized-accelerate),
      width 220ms var(--md-sys-motion-easing-emphasized-accelerate),
      height 220ms var(--md-sys-motion-easing-emphasized-accelerate),
      border-radius 220ms var(--md-sys-motion-easing-emphasized-accelerate),
      box-shadow 220ms var(--md-sys-motion-easing-emphasized-accelerate)
    `;
    surface.style.top = `${origin.top}px`;
    surface.style.left = `${origin.left}px`;
    surface.style.width = `${origin.width}px`;
    surface.style.height = `${origin.height}px`;
    surface.style.borderRadius = "16px";
    surface.style.boxShadow = "var(--shadow-level-1)";

    closeTimerRef.current = setTimeout(() => {
      if (triggerElRef.current) {
        triggerElRef.current.style.visibility = "visible";
      }
      setPhase("idle");
      triggerElRef.current?.focus();
    }, 230);
  }, [prefersReducedMotion]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (phase !== "idle") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [phase]);

  // Start forward flight once measured
  React.useEffect(() => {
    if (phase !== "measuring") return;

    const surface = surfaceElRef.current;
    const triggerEl = triggerElRef.current;
    const measureEl = measureElRef.current;
    const origin = originRectRef.current;

    if (!surface || !triggerEl || !measureEl || !origin) return;

    // 1. Calculate destination bounds
    const measuredHeight = measureEl.scrollHeight || 420;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const target = calculateCenteredTargetRect(viewport, measuredHeight, maxWidth, 16);
    targetRectRef.current = target;

    // 2. Hide original card in grid (preserves layout box)
    triggerEl.style.visibility = "hidden";

    // 3. If user prefers reduced motion, position directly without spring flight
    if (prefersReducedMotion) {
      surface.style.transition = "none";
      surface.style.top = `${target.top}px`;
      surface.style.left = `${target.left}px`;
      surface.style.width = `${target.width}px`;
      surface.style.height = `${target.height}px`;
      surface.style.borderRadius = "28px";
      surface.style.boxShadow = "var(--shadow-level-3)";
      setPhase("open");
      surface.focus();
      return;
    }

    // 4. Position surface exactly on top of original card
    surface.style.transition = "none";
    surface.style.top = `${origin.top}px`;
    surface.style.left = `${origin.left}px`;
    surface.style.width = `${origin.width}px`;
    surface.style.height = `${origin.height}px`;
    surface.style.borderRadius = "16px";
    surface.style.boxShadow = "var(--shadow-level-1)";

    // 5. Double rAF to ensure browser renders start state, then play spring flight
    let timer: NodeJS.Timeout;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("animating-open");

        surface.style.transition = `
          top var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          left var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          width var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          height var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          border-radius var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          box-shadow var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects)
        `;
        surface.style.top = `${target.top}px`;
        surface.style.left = `${target.left}px`;
        surface.style.width = `${target.width}px`;
        surface.style.height = `${target.height}px`;
        surface.style.borderRadius = "28px";
        surface.style.boxShadow = "var(--shadow-level-3)";

        timer = setTimeout(() => {
          setPhase("open");
          surface.focus();
        }, 500);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [phase, maxWidth, prefersReducedMotion]);

  // Escape key to close
  React.useEffect(() => {
    if (phase === "idle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, handleClose]);

  const isOpenOrAnimating = phase !== "idle";
  const isExpanded = phase === "animating-open" || phase === "open";

  return (
    <>
      {/* Trigger rendered in normal DOM flow */}
      {trigger({
        open: handleOpen,
        isOpen: isOpenOrAnimating,
        ref: setTriggerRef,
      })}

      {/* Portal for the flying container */}
      {isOpenOrAnimating && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-label={title || "Expanded details"}
            >
              {/* Offscreen element for exact height measurement */}
              <div
                ref={measureElRef}
                className="fixed -left-[9999px] top-0 invisible pointer-events-none p-6"
                style={{ width: `${Math.min(typeof window !== "undefined" ? window.innerWidth - 32 : 600, maxWidth)}px` }}
                aria-hidden="true"
              >
                {children({ close: handleClose })}
              </div>

              {/* Scrim backdrop */}
              <div
                className={cn(
                  "fixed inset-0 bg-scrim/32 backdrop-blur-[2px] transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={handleClose}
                aria-hidden="true"
              />

              {/* The Physical Flying Surface */}
              <div
                ref={surfaceElRef}
                tabIndex={-1}
                data-phase={phase}
                className={cn(
                  "fixed z-10 overflow-hidden bg-surface-container-high text-on-surface outline-none will-change-[top,left,width,height,transform]",
                  phase === "open" ? "overflow-y-auto" : "overflow-hidden",
                  className
                )}
              >
                {/* Compact Card Layer (cross-fades out during expansion) */}
                {triggerContent && (
                  <div
                    className={cn(
                      "absolute inset-0 pointer-events-none transition-opacity duration-150",
                      isExpanded ? "opacity-0 invisible" : "opacity-100 visible"
                    )}
                    aria-hidden={isExpanded}
                  >
                    {triggerContent}
                  </div>
                )}

                {/* Expanded Detail Layer (cross-fades in during expansion) */}
                <div
                  className={cn(
                    "h-full w-full transition-opacity",
                    isExpanded ? "opacity-100" : "opacity-0",
                    isExpanded ? "duration-300 delay-75" : "duration-100"
                  )}
                >
                  {children({ close: handleClose })}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

/** Backwards-compatible alias */
export const M3ContainerTransform = ContainerTransform;
