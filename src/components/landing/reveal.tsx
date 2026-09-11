"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const EASE = "power3.out";

/**
 * Registers the scroll-linked entrances for everything marked up declaratively.
 *
 * One ScrollTrigger factory for the whole page instead of a trigger per
 * component: the reveals are all the same gesture, and a single pass keeps the
 * trigger count (and therefore the per-scroll work) proportional to what is
 * actually on screen rather than to the component tree.
 *
 * Markup contract:
 *   data-sm-reveal="up|fade"   translate + fade on entering the viewport
 *   data-sm-mask               clip-path wipe, for figures
 *   data-sm-split              line-by-line serif reveal, for headings
 *   data-sm-stagger            stagger this element's reveal children
 */
export function RevealStage() {
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      // --- line-by-line heading reveals -------------------------------------
      // `mask: "lines"` wraps each line so it can slide out from behind its own
      // edge; without it the ascenders of the next line clip through.
      gsap.utils.toArray<HTMLElement>("[data-sm-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "sm-split-line",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              { yPercent: 108, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 1.15,
                stagger: 0.085,
                ease: EASE,
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  once: true,
                },
                onComplete: () => {
                  self.lines.forEach((line) => {
                    if (line instanceof HTMLElement) {
                      line.style.overflow = "visible";
                      line.style.willChange = "auto";
                      if (line.parentElement instanceof HTMLElement) {
                        line.parentElement.style.overflow = "visible";
                      }
                    }
                  });
                  if (el instanceof HTMLElement) {
                    el.style.overflow = "visible";
                  }
                },
              },
            ),
        });
        // The element itself is held at opacity 0 by CSS until the split has
        // run, so a slow font load cannot flash unsplit text.
        gsap.set(el, { opacity: 1 });
      });

      // --- staggered groups --------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-sm-stagger]").forEach((group) => {
        const items = gsap.utils.toArray<HTMLElement>(
          "[data-sm-reveal]",
          group,
        );
        if (!items.length) return;
        const triggerSelector = group.getAttribute("data-sm-trigger");
        const trigger = triggerSelector
          ? document.querySelector<HTMLElement>(triggerSelector) || group
          : group;
        const start = group.getAttribute("data-sm-start") || "top 85%";

        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.09,
          ease: EASE,
          scrollTrigger: { trigger, start, once: true },
          onComplete: () => {
            gsap.set(items, { willChange: "auto" });
          },
        });
      });

      // --- lone reveals ------------------------------------------------------
      gsap.utils
        .toArray<HTMLElement>("[data-sm-reveal]")
        .filter((el) => !el.closest("[data-sm-stagger]"))
        .forEach((el) => {
          const triggerSelector = el.getAttribute("data-sm-trigger");
          const trigger = triggerSelector
            ? document.querySelector<HTMLElement>(triggerSelector) || el
            : el;
          const start = el.getAttribute("data-sm-start") || "top 88%";

          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: EASE,
            scrollTrigger: { trigger, start, once: true },
            onComplete: () => {
              gsap.set(el, { willChange: "auto" });
            },
          });
        });

      // --- figure wipes ------------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-sm-mask]").forEach((el) => {
        gsap.to(el, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.45,
          ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onComplete: () => {
            gsap.set(el, { willChange: "auto" });
          },
        });
      });
    });

    return () => ctx.revert();
  }, [reduce]);

  return null;
}
