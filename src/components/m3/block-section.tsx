import * as React from "react";

import { ExpressiveCard, type ExpressiveCardProps } from "@/components/m3/expressive-card";
import { IconChip } from "@/components/m3/icon-chip";
import { cn } from "@/lib/utils";

import type { iconChipVariants } from "@/components/m3/icon-chip";
import type { VariantProps } from "class-variance-authority";

/**
 * A titled block: the expressive language's replacement for
 * `Card + CardHeader + CardTitle + CardDescription + CardContent`.
 *
 * That five-component composition is the single most repeated shape in this
 * codebase, and it carries two things this language does differently:
 *
 * - **The title is a `text-base` bold, not a `title-lg`.** These blocks stack
 *   three and four deep on a phone screen. At `title-lg` every block header
 *   competes with the `PageHeader` above them and the page reads as four pages;
 *   at 16px bold a header is clearly subordinate to the page title and still
 *   clearly above its own body text.
 * - **An icon, and the icon is the anchor.** `CardHeader` had no icon slot, so
 *   blocks were told apart by reading them. With a 40dp `IconChip` in the
 *   corner, a member scrolling their profile finds the PIN block by shape.
 *
 * `action` is the trailing slot for one control — an "add" button, a filter, a
 * count. It sits on the header row, aligned to the title, so it stays reachable
 * with a thumb at the top of a block rather than after its content.
 */
export type BlockSectionProps = {
  icon?: React.ComponentType<{ className?: string }>;
  iconTone?: VariantProps<typeof iconChipVariants>["tone"];
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  tone?: ExpressiveCardProps["tone"];
  padding?: ExpressiveCardProps["padding"];
  className?: string;
  /** Body wrapper classes — the common case is `space-y-*` or a grid. */
  bodyClassName?: string;
  /** When true, cascades entrance delays across child rows/elements. */
  staggerChildren?: boolean;
};

export function BlockSection({
  icon,
  iconTone,
  title,
  description,
  action,
  children,
  tone,
  padding,
  className,
  bodyClassName,
  staggerChildren = false,
}: BlockSectionProps) {
  return (
    <ExpressiveCard
      tone={tone}
      padding={padding}
      className={cn("gap-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <IconChip icon={icon} tone={iconTone} /> : null}
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
            {description ? (
              <p className="text-xs text-on-surface-variant sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children ? (
        <div
          suppressHydrationWarning
          data-stagger={staggerChildren ? "items" : undefined}
          className={cn("min-w-0", bodyClassName)}
        >
          {children}
        </div>
      ) : null}
    </ExpressiveCard>
  );
}

/**
 * A row inside a block: the tonal replacement for `rounded-md border p-3`.
 *
 * The list item is where the old and new languages differ most bluntly. A
 * bordered row on a white card is a table row that lost its table; a
 * `surface-container-high` row at 16dp inside a `surface-container-low` block is
 * M3's actual list treatment, and it survives dark mode without the border
 * turning into a grey scratch.
 */
export function BlockRow({
  children,
  className,
  interactive = false,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  asChild?: boolean;
}) {
  return (
    <ExpressiveCard
      tone="nested"
      padding="compact"
      interactive={interactive}
      asChild={asChild}
      className={cn(
        "flex-row items-center justify-between gap-3",
        interactive ? "hover:-translate-y-0 hover:shadow-level-0" : "",
        className,
      )}
    >
      {children}
    </ExpressiveCard>
  );
}
