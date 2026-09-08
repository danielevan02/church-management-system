import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The tinted icon container that opens almost every block in the expressive
 * layout language.
 *
 * It exists because M3's own guidance — "selection and emphasis are a *shaped
 * container*, not a colour-only change" — applies to decorative icons too. A
 * bare `text-primary` icon next to a heading reads as an inline glyph; the same
 * icon inside a filled, rounded square reads as the block's identity mark, and
 * that is what lets a page of otherwise identical tonal cards stay scannable.
 *
 * Sizes step with the block they label, not with the icon: `sm` (28dp, 8dp
 * radius) for a section heading, `md` (40dp, 16dp) for a card, `lg` (48dp, 20dp)
 * for a hero. The radius intentionally does *not* stay proportional — a small
 * chip at 16dp radius reads as a circle, which is the avatar's shape and would
 * collide with it.
 */
const iconChipVariants = cva(
  "inline-flex shrink-0 items-center justify-center transition-[background-color,color] motion-effects-fast",
  {
    variants: {
      tone: {
        /** Default. Quiet enough to repeat down a long page. */
        primary: "bg-primary/10 text-primary",
        /** The loudest tone available without leaving the accent family. */
        secondary: "bg-secondary-container text-on-secondary-container",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        /** For blocks whose subject is neutral (settings, archives, counts). */
        neutral: "bg-surface-container-high text-primary",
        error: "bg-error-container text-on-error-container",
        success: "bg-success-container text-on-success-container",
        warning: "bg-warning-container text-on-warning-container",
        /** Inverted: for use on a filled primary surface. */
        onPrimary: "bg-on-primary/15 text-on-primary",
      },
      size: {
        sm: "h-7 w-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 w-10 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
        lg: "h-12 w-12 rounded-[1.25rem] [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  },
);

export type IconChipProps = React.ComponentProps<"span"> &
  VariantProps<typeof iconChipVariants> & {
    icon: React.ComponentType<{ className?: string }>;
  };

export function IconChip({
  icon: Icon,
  tone,
  size,
  className,
  ...props
}: IconChipProps) {
  return (
    <span
      data-slot="icon-chip"
      aria-hidden
      className={cn(iconChipVariants({ tone, size }), className)}
      {...props}
    >
      <Icon />
    </span>
  );
}

export { iconChipVariants };
