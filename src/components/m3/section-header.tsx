import * as React from "react";
import { ArrowRight } from "lucide-react";

import { IconChip } from "@/components/m3/icon-chip";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The heading of a block group — one step down from `PageHeader`.
 *
 * Composition: a 28dp `IconChip`, a `text-base` bold title, an optional count,
 * and a trailing text link with a forward arrow. The chip is doing real work
 * here rather than decorating: a page in this language is a stack of large tonal
 * blocks with no rules between them, so the eye needs a hard mark to find where
 * one group ends and the next begins. A bare bold string does not survive that.
 *
 * `px-1` on the row, not on the blocks below it. The blocks are full-bleed
 * within the content column and the heading insets to align with their padded
 * content — the opposite of the usual arrangement, and what stops the heading
 * from looking detached from the group it names.
 *
 * `size="sm"` is for a heading *inside* a block rather than above one, which is
 * a different job with a different failure. `BlockSection`'s own title is a
 * `text-base` bold, so a default `SectionHeader` nested in one renders the two
 * levels identically — on the admin dashboard "Services" came out looking
 * exactly as important as "Today & upcoming" that contained it. `sm` drops to
 * the 12px eyebrow already established by `PageHeader` and `StatTile`, which
 * subordinates unmistakably without inventing a fourth type size.
 */
export type SectionHeaderProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  /** Rendered as a quiet pill after the title. Use for "12 anggota", not for IDs. */
  count?: React.ReactNode;
  /** The canonical trailing action: a link with a forward arrow. */
  action?: { href: string; label: string };
  /** Anything else — a filter, a menu, a segmented button. Wins over `action`. */
  children?: React.ReactNode;
  /** `sm` for a sub-heading inside a block. */
  size?: "default" | "sm";
  className?: string;
};

export function SectionHeader({
  icon,
  title,
  count,
  action,
  children,
  size = "default",
  className,
}: SectionHeaderProps) {
  const sm = size === "sm";

  return (
    <div
      data-slot="section-header"
      data-size={sm ? "sm" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 px-1",
        sm ? "min-h-7" : "",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <IconChip icon={icon} size="sm" /> : null}
        <h2
          className={cn(
            "truncate",
            sm
              ? "text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              : "text-base font-bold text-on-surface",
          )}
        >
          {title}
        </h2>
        {count !== undefined && count !== null ? (
          <span className="shrink-0 rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-semibold text-on-surface-variant">
            {count}
          </span>
        ) : null}
      </div>

      {children ??
        (action ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "shrink-0 rounded-full text-primary",
              sm ? "h-7 px-3 text-[11px] font-semibold" : "text-xs",
            )}
          >
            <Link href={action.href} className="flex items-center gap-1">
              <span>{action.label}</span>
              <ArrowRight className={sm ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </Link>
          </Button>
        ) : null)}
    </div>
  );
}
