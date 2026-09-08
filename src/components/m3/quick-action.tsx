import * as React from "react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The quick-action tile grid — the row of square shortcuts under a hero.
 *
 * Two things make this different from every other block in the language, and
 * both are on purpose:
 *
 * - **It has a border.** Nothing else here does. The tiles sit in a tight grid
 *   with 10dp gutters, and at that spacing a shared `surface-container-low` fill
 *   with no border reads as one wide block with icons in it rather than as six
 *   separate targets. A 40%-opacity `outline-variant` hairline is the cheapest
 *   thing that restores "six things".
 * - **The icon inverts on hover.** The circle goes from `primary/10` to a filled
 *   `primary`. This is the one hover state in the language that changes an
 *   accent *role* rather than a surface tone, because a 96dp tile has no text to
 *   underline and no shadow budget to spend.
 *
 * `quickActionTileClass` is exported separately because the giving and prayer
 * tiles are `ContainerTransform` triggers — client components that need the exact
 * same box but cannot be a `Link`. Sharing the string is what keeps the grid from
 * drifting into three slightly different tiles, which is what it had done.
 */
export const quickActionTileClass = cn(
  "group flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 sm:h-28",
  "rounded-2xl border border-outline-variant/40 bg-surface-container-low px-2 py-3 text-center",
  "shadow-level-0 shape-morph-interactive",
  "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container hover:shadow-level-1",
  "active:translate-y-0 active:scale-[0.98] active:rounded-lg",
  "m3-focus-ring",
);

/** The inverting icon circle. Requires `group` on the tile. */
export function QuickActionIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary motion-effects-fast transition-[background-color,color,transform] group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary"
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

/** The tile label. Requires `group` on the tile. */
export function QuickActionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-full truncate px-1 text-center text-[11px] font-semibold tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-xs">
      {children}
    </span>
  );
}

export function QuickActionTile({
  href,
  icon,
  label,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(quickActionTileClass, className)}>
      <QuickActionIcon icon={icon} />
      <QuickActionLabel>{label}</QuickActionLabel>
    </Link>
  );
}

/**
 * Three across on a phone, six on a laptop.
 *
 * Three, not four: at four columns a 360dp viewport leaves 78dp per tile, and an
 * Indonesian label like "Persembahan" cannot be truncated to fit without losing
 * which word it was. The grid skips 4 and 5 columns entirely — those widths are
 * tablets, where six half-width tiles would each be 160dp and look like buttons
 * that lost their form.
 */
export function QuickActionGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      suppressHydrationWarning
      data-stagger="cards"
      className={cn(
        "grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
