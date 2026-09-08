import * as React from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { ExpressiveCard } from "@/components/m3/expressive-card";
import { IconChip } from "@/components/m3/icon-chip";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

import type { iconChipVariants } from "@/components/m3/icon-chip";
import type { VariantProps } from "class-variance-authority";

/**
 * A single metric, as a block.
 *
 * The layout is label-above-value, not value-above-label. A KPI row is read by
 * scanning for the *thing* first and the number second — "kehadiran… 214", never
 * "214… of what" — and the eyebrow treatment already established by `PageHeader`
 * makes the label legible at 12px without competing with the number.
 *
 * The number is `tabular-nums`. Without it a row of tiles jitters horizontally
 * as the digits change between renders, which is very visible when four tiles
 * sit in a grid and only one of them updates.
 *
 * `delta` is a signed change, coloured by *direction*, not by sign: `invertDelta`
 * exists because a rise in absentees is not good news. Nothing in this component
 * decides which way is up.
 *
 * The tile takes the block's **default** inset, not `compact`, and the icon chip
 * is the reason. A KPI tile is the one shape in this language that deliberately
 * parks content in all four corners — label top-left, chip top-right, hint
 * bottom-left — so it is the shape most exposed to the corner arc. `rounded-3xl`
 * is 48dp on this project's M3 shape scale, and at `compact`'s 16dp inset the
 * chip had 16dp of clearance at the edges but only 2.7dp across the diagonal,
 * which is why it read as wedged into the curve. The 24dp of `default` at `sm`
 * and up takes that to 14.1dp.
 */
export type StatTileProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: VariantProps<typeof iconChipVariants>["tone"];
  hint?: React.ReactNode;
  delta?: { value: React.ReactNode; direction: "up" | "down" | "flat" };
  /** Up is good by default. Set for metrics where a rise is bad. */
  invertDelta?: boolean;
  href?: string;
  className?: string;
};

export function StatTile({
  label,
  value,
  icon,
  tone = "primary",
  hint,
  delta,
  invertDelta = false,
  href,
  className,
}: StatTileProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        {icon ? <IconChip icon={icon} tone={tone} size="sm" /> : null}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-on-surface sm:text-3xl">
          {value}
        </span>
        {delta ? <DeltaPill {...delta} invert={invertDelta} /> : null}
      </div>

      {hint ? (
        <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <ExpressiveCard
        asChild
        interactive
        className={cn("group", className)}
      >
        <Link href={href}>{body}</Link>
      </ExpressiveCard>
    );
  }

  return (
    <ExpressiveCard className={className}>
      {body}
    </ExpressiveCard>
  );
}

function DeltaPill({
  value,
  direction,
  invert,
}: {
  value: React.ReactNode;
  direction: "up" | "down" | "flat";
  invert: boolean;
}) {
  const good = direction === "flat" ? null : invert ? direction === "down" : direction === "up";
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums",
        good === null
          ? "bg-surface-container-high text-on-surface-variant"
          : good
            ? "bg-success-container text-on-success-container"
            : "bg-error-container text-on-error-container",
      )}
    >
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}

/**
 * The KPI row. Two across on a phone — one is a waste of a 360dp width, and
 * three makes a five-digit rupiah figure wrap mid-number.
 */
export function StatGrid({
  children,
  className,
  columns = 4,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      suppressHydrationWarning
      data-stagger="cards"
      className={cn(
        "grid grid-cols-2 gap-3",
        columns === 2
          ? "sm:grid-cols-2"
          : columns === 3
            ? "sm:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
