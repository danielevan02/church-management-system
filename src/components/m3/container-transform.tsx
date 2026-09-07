"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import {
  calculateContainerDelta,
  getInvertedTransformStyle,
  type Rect,
} from "@/lib/container-transform";
import { cn } from "@/lib/utils";

export interface M3ContainerTransformProps {
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
   * The expanded content surface (e.g. Modal, Details Sheet).
   * Receives `close` callback to reverse transformation.
   */
  children: (props: { close: () => void }) => React.ReactNode;

  /** Optional class name for the expanded container wrapper */
  className?: string;

  /** Optional accessible title / label for dialog */
  title?: string;
}

/**
 * Material 3 Container Transform Component
 *
 * Implements M3's container transform transition pattern using FLIP
 * (First, Last, Invert, Play) driven by M3's physics-based spatial spring.
 *
 * - The container morphs from the origin (trigger) bounds to destination bounds.
 * - Spatial properties (position, scale) use the M3 spatial spring with overshoot.
 * - Opacity / scrim use the critically damped effects spring (no bounce).
 * - Fully reversible: closing returns smoothly to the trigger's coordinates.
 * - Handles Escape key, click outside, focus management, and prefers-reduced-motion.
 */
export function M3ContainerTransform({
  trigger,
  children,
  className,
  title,
}: M3ContainerTransformProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRendered, setIsRendered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const triggerElRef = React.useRef<HTMLElement | null>(null);
  const surfaceElRef = React.useRef<HTMLDivElement | null>(null);
  const originRectRef = React.useRef<Rect | null>(null);

  // Check reduced motion
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

  const setTriggerRef = React.useCallback((node: HTMLElement | null) => {
    triggerElRef.current = node;
  }, []);

  // Open handler: Capture origin and mount
  const handleOpen = React.useCallback(() => {
    if (triggerElRef.current) {
      const rect = triggerElRef.current.getBoundingClientRect();
      originRectRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    setIsRendered(true);
    setIsOpen(true);
    setIsAnimating(true);
  }, []);

  // Close handler: Play reverse animation to trigger
  const handleClose = React.useCallback(() => {
    if (!surfaceElRef.current || prefersReducedMotion) {
      setIsOpen(false);
      setIsRendered(false);
      setIsAnimating(false);
      triggerElRef.current?.focus();
      return;
    }

    setIsAnimating(true);
    setIsOpen(false);

    // Re-measure trigger in case layout shifted slightly
    if (triggerElRef.current) {
      const rect = triggerElRef.current.getBoundingClientRect();
      originRectRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }

    const surface = surfaceElRef.current;
    const destRect = surface.getBoundingClientRect();

    if (originRectRef.current) {
      const delta = calculateContainerDelta(originRectRef.current, destRect);
      surface.style.transition =
        "transform 200ms var(--md-sys-motion-easing-emphasized-accelerate), opacity 150ms linear";
      surface.style.transform = getInvertedTransformStyle(delta);
      surface.style.opacity = "0";
    }

    const timer = setTimeout(() => {
      setIsRendered(false);
      setIsAnimating(false);
      triggerElRef.current?.focus();
    }, 220);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Play forward animation when rendered
  React.useEffect(() => {
    if (!isRendered || !isOpen) return;

    if (prefersReducedMotion) {
      setIsAnimating(false);
      surfaceElRef.current?.focus();
      return;
    }

    const surface = surfaceElRef.current;
    if (!surface || !originRectRef.current) return;

    const destRect = surface.getBoundingClientRect();
    const delta = calculateContainerDelta(originRectRef.current, destRect);

    // 1. Invert
    surface.style.transformOrigin = "0 0";
    surface.style.transition = "none";
    surface.style.transform = getInvertedTransformStyle(delta);
    surface.style.opacity = "0.8";

    // 2. Play (Double rAF ensures browser paints inverted state first)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!surface) return;
        surface.style.transition =
          "transform var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial), opacity var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects)";
        surface.style.transform = "translate(0px, 0px) scale(1, 1)";
        surface.style.opacity = "1";
      });
    });

    const finishTimer = setTimeout(() => {
      setIsAnimating(false);
      surface.focus();
    }, 500);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(finishTimer);
    };
  }, [isRendered, isOpen, prefersReducedMotion]);

  // Keyboard accessibility: Escape to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  return (
    <>
      {trigger({
        open: handleOpen,
        isOpen,
        ref: setTriggerRef,
      })}

      {isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title || "Expanded details"}
            >
              {/* Scrim */}
              <div
                className={cn(
                  "fixed inset-0 bg-scrim/32 backdrop-blur-[2px] transition-opacity duration-300",
                  isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={handleClose}
                aria-hidden="true"
              />

              {/* Expanded Surface */}
              <div
                ref={surfaceElRef}
                tabIndex={-1}
                data-animating={isAnimating ? "" : undefined}
                className={cn(
                  "relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-surface-container-high text-on-surface shadow-level-3 outline-none will-change-transform",
                  className
                )}
              >
                {children({ close: handleClose })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
