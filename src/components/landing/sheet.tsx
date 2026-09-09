"use client";

import * as React from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * The page's one overlay primitive, built on a native `<dialog>`.
 *
 * `showModal()` is doing real work here that a div-based overlay would have to
 * reimplement badly: it puts the panel in the top layer (so it clears the
 * fixed nav without a z-index arms race), traps focus, makes the rest of the
 * document inert, restores focus on close, and handles Escape. What is left to
 * write is the motion and the scroll lock.
 *
 * Variants are the same panel anchored differently — a side sheet reads as a
 * drawer off the page edge, a bottom sheet is the right gesture on a phone,
 * and `center` is for media.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  variant = "side",
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "side" | "center";
  labelledBy?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const dialog = ref.current;
    const panel = panelRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      lenis?.stop();
      if (panel && !reduce) {
        gsap.fromTo(
          panel,
          variant === "side"
            ? { xPercent: 8, opacity: 0 }
            : { scale: 0.965, opacity: 0 },
          {
            xPercent: 0,
            scale: 1,
            opacity: 1,
            duration: 0.62,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
      }
      return;
    }

    if (!dialog.open) return;
    lenis?.start();
    if (panel && !reduce) {
      gsap.to(panel, {
        opacity: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => dialog.close(),
      });
    } else {
      dialog.close();
    }
  }, [open, lenis, reduce, variant]);

  // The Escape key closes a native dialog on its own; this keeps React's state
  // in step with that, and covers a click on the backdrop.
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
    };
  }, [onClose]);

  React.useEffect(() => () => lenis?.start(), [lenis]);

  return (
    <dialog
      ref={ref}
      className={`sm-sheet sm-sheet-${variant}`}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : title}
    >
      <div ref={panelRef} className="sm-sheet-panel sm-tone-light">
        <button
          type="button"
          onClick={onClose}
          className="sm-sheet-close"
          aria-label={title}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        {description ? (
          <p className="sr-only">{description}</p>
        ) : null}
        {children}
      </div>
    </dialog>
  );
}
