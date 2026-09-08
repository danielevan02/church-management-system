import * as React from "react";

import { IconChip } from "@/components/m3/icon-chip";
import { cn } from "@/lib/utils";

/**
 * Label-and-value rows for a detail screen.
 *
 * Deliberately *not* a `<table>` and deliberately not rule-separated. M3 uses
 * tone and space for grouping, so the rows sit in a block with 16dp gutters and
 * no dividers; where a row needs to be found by eye rather than read in order,
 * it gets an `IconChip` instead of a rule.
 *
 * `<dl>` rather than divs, because that is what this is — and it is the reason a
 * screen reader announces "alamat, Jalan Merdeka 12" as a pair instead of as two
 * unrelated strings.
 */
export function DetailList({
  children,
  className,
  columns = 2,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <dl
      data-slot="detail-list"
      className={cn(
        "grid gap-4",
        columns === 2 ? "sm:grid-cols-2" : "",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function DetailRow({
  icon,
  label,
  children,
  className,
  span,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Let a long value (an address, a note) take the full row. */
  span?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-3",
        span ? "sm:col-span-2" : "",
        className,
      )}
    >
      {icon ? <IconChip icon={icon} size="sm" tone="neutral" className="mt-0.5" /> : null}
      <div className="min-w-0 space-y-0.5">
        <dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </dt>
        <dd className="text-sm font-medium text-on-surface">{children}</dd>
      </div>
    </div>
  );
}
