import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The screen-opening block: accent gradient, optional ambient artwork, a badge,
 * a title and a row of actions.
 *
 * Generalised from the member dashboard's worship pass. Two mechanics are worth
 * keeping straight:
 *
 * **The gradient is not a decoration, it is the tonal step.** `from-primary/10
 * via-surface-container-high to-surface-container` runs the accent out of the
 * top-left corner and lands on a neutral container — so the block reads as
 * accented at the point where the eye enters it and as a plain surface where the
 * text sits. A flat `primary-container` fill would force every label onto
 * `on-primary-container` and make the hero the loudest thing on a page that
 * still has a bottom nav bar to compete with.
 *
 * **The artwork is masked, not faded.** `opacity` alone leaves a visible
 * rectangle edge. A horizontal `mask-image` ramp (transparent → 60% → opaque)
 * dissolves the left edge into the gradient so there is no seam behind the text,
 * and `mix-blend-multiply` in light / `screen` in dark keeps the image reading as
 * *tinted by* the surface rather than pasted onto it — which is what stops it
 * from breaking when the theme flips.
 */
export type HeroBannerProps = {
  badge?: { icon?: React.ComponentType<{ className?: string }>; label: React.ReactNode };
  /** Small trailing text on the badge row — a name, a date, a count. */
  meta?: React.ReactNode;
  title: React.ReactNode;
  /** The accent-coloured line under the title: a time, a place, a status. */
  detail?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  artwork?: { src: string; alt?: string; priority?: boolean };
  className?: string;
};

export function HeroBanner({
  badge,
  meta,
  title,
  detail,
  description,
  children,
  actions,
  artwork,
  className,
}: HeroBannerProps) {
  return (
    <div
      data-slot="hero-banner"
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 shadow-level-0 sm:p-7",
        "bg-linear-to-br from-primary/10 via-surface-container-high to-surface-container",
        className,
      )}
    >
      {artwork ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-3/4 select-none overflow-hidden sm:w-2/3"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 45%, black 85%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 45%, black 85%)",
          }}
        >
          <Image
            src={artwork.src}
            alt={artwork.alt ?? ""}
            fill
            sizes="(max-width: 768px) 75vw, 500px"
            className="object-cover object-right opacity-35 mix-blend-multiply saturate-[0.85] dark:opacity-30 dark:mix-blend-screen"
            priority={artwork.priority}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col gap-4">
        {badge || meta ? (
          <div className="flex items-center justify-between gap-2">
            {badge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {badge.icon ? <badge.icon className="h-3.5 w-3.5" /> : null}
                <span>{badge.label}</span>
              </span>
            ) : (
              <span />
            )}
            {meta ? (
              <span className="truncate text-xs font-medium text-on-surface-variant">
                {meta}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-on-surface sm:text-2xl">
            {title}
          </h2>
          {detail ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant sm:text-sm">
              {detail}
            </div>
          ) : null}
          {description ? (
            <p className="max-w-prose text-xs text-on-surface-variant sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {actions ? (
          <div className="flex flex-wrap items-center gap-2.5 pt-1">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
