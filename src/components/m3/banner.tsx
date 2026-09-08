import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { IconChip } from "@/components/m3/icon-chip";
import { cn } from "@/lib/utils";

/**
 * An inline notice: install prompt, push opt-in, offline warning, "check-in is
 * open now".
 *
 * M3 has no inline alert component, which is why `ui/alert.tsx` maps onto
 * container role *pairs* rather than a spec component. This is the expressive
 * language's version of the same idea, and it differs from `ui/alert.tsx` in
 * one way that matters: a banner is transient and interactive — it holds the
 * button that dismisses or accepts it — so it is shaped at 16dp and given a
 * filled container rather than an outline, which is what stops a stack of two
 * banners above a page's content from reading as part of the content.
 *
 * Tones are container/on-container pairs, never `primary/10`-style washes. A
 * banner has text at small sizes on top of its fill, and a 10% wash of the
 * accent over an unknown surface is not a contrast guarantee.
 */
const bannerVariants = cva(
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3",
  {
    variants: {
      tone: {
        /** Default: an offer, not a problem. */
        info: "bg-secondary-container text-on-secondary-container",
        neutral: "bg-surface-container-high text-on-surface",
        success: "bg-success-container text-on-success-container",
        warning: "bg-warning-container text-on-warning-container",
        error: "bg-error-container text-on-error-container",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

export type BannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    icon?: React.ComponentType<{ className?: string }>;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
  };

const CHIP_TONE = {
  info: "secondary",
  neutral: "neutral",
  success: "success",
  warning: "warning",
  error: "error",
} as const;

export function Banner({
  icon,
  title,
  description,
  actions,
  tone = "info",
  className,
  ...props
}: BannerProps) {
  return (
    <div
      data-slot="banner"
      className={cn(bannerVariants({ tone }), className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <IconChip
            icon={icon}
            size="sm"
            tone={CHIP_TONE[tone ?? "info"]}
            /* The chip sits on an already-tonal surface, so it drops its own
               fill and keeps only the glyph — otherwise two container tones
               stack and the icon reads as a button. */
            className="bg-transparent"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-bold">{title}</p>
          {description ? (
            <p className="text-xs opacity-80">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      ) : null}
    </div>
  );
}

export { bannerVariants };
