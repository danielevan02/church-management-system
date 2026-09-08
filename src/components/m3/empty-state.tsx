import * as React from "react";

import { IconChip } from "@/components/m3/icon-chip";
import { cn } from "@/lib/utils";

/**
 * The empty state of the expressive layout language.
 *
 * It replaces `rounded-md border border-dashed p-10 text-center`, which this
 * codebase had in ~20 places. A dashed border is a placeholder convention
 * borrowed from admin templates: it says "content failed to arrive". In a
 * portal most empty states are not failures — a member with no prayer requests
 * yet, a household with no children — so this is a real tonal block like any
 * other, with the icon promoted into an `lg` chip and a title that is allowed to
 * say something.
 *
 * `tone="quiet"` drops the fill for empty states *inside* an already-tonal
 * block, where another surface step would stack.
 *
 * `size="sm"` is the other thing nesting needs, and the reason it exists is the
 * admin dashboard: four empty sub-sections inside two blocks, each rendering a
 * 48dp chip above a 16px bold line, took more vertical space than every filled
 * row on the page put together. At that depth the absence of three services is
 * not a subject — it is a footnote — so `sm` collapses to a single centred row
 * of muted text with a bare 16dp glyph, no chip and no display weight. Call
 * sites had been reaching for `className="py-6"` to fake this; that only ever
 * cut the padding and left the chip and the bold title at full size.
 */
export type EmptyStateProps = {
  /** Optional, but pass one where the module has an obvious mark. */
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "block" | "quiet";
  /** `sm` for an empty *sub*-section inside a block. */
  size?: "default" | "sm";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "block",
  size = "default",
  className,
}: EmptyStateProps) {
  const fill = tone === "block" ? "bg-surface-container-low shadow-level-0" : "";

  if (size === "sm") {
    return (
      <div
        data-slot="empty-state"
        data-size="sm"
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl px-4 py-5 text-center",
          fill,
          className,
        )}
      >
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0 text-on-surface-variant" />
        ) : null}
        <p className="text-sm font-medium text-on-surface-variant">{title}</p>
        {description ? (
          <p className="w-full text-xs text-on-surface-variant">{description}</p>
        ) : null}
        {action ? <div className="w-full pt-2">{action}</div> : null}
      </div>
    );
  }

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-12 text-center",
        fill,
        className,
      )}
    >
      {Icon ? <IconChip icon={Icon} size="lg" tone="neutral" /> : null}
      <div className="space-y-1">
        <p className="text-base font-bold text-on-surface">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
