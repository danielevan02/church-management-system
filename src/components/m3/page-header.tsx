import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The page-level header of the expressive layout language.
 *
 * The pattern is M3's "eyebrow + headline", the same one `ui/card.tsx` uses for
 * card headers, lifted to the page: a tracked uppercase `label` in `primary`
 * above the name of the screen. The eyebrow is what carries the categorisation,
 * which is why it is allowed to be the only accent-coloured text in the header.
 *
 * **A documented deviation.** M3 almost never sets headline text bold, and
 * `docs/design-system.md` says so. This header does. The reason is that these
 * screens are read on a phone held at arm's length, one thumb on a bottom nav
 * bar, and a `headline-sm` at regular weight loses the top of the visual
 * hierarchy to the first tonal block below it — which in this language is large,
 * 24dp and coloured. Bold at 24/30px is what keeps the title winning. This is
 * the one place the expressive language overrides the spec on purpose; it is not
 * licence to bold headlines elsewhere.
 *
 * `subtitle` sits *below* the title in `on-surface-variant`, never beside it.
 * `action` is a trailing slot — one button, or the avatar pill on the dashboard.
 * `backHref` turns the header into a detail-page header: a 44dp circular target,
 * which is the floor for a control that is the only way back out of a screen.
 *
 * **`backLabel` doubles as the default eyebrow.** The screens this replaced put
 * the parent's name in a text back-link — "‹ Budi Santoso" above "Ubah Data
 * Jemaat" — and an icon-only back button would have thrown that away. Since the
 * parent record is a better categorisation of a detail page than its module name
 * is, the label moves into the eyebrow and the button keeps it as its
 * `aria-label`. Pass `eyebrow` explicitly to override.
 */
export type PageHeaderProps = {
  /** An avatar or monogram identifying the record. Detail pages only. */
  leading?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function PageHeader({
  leading,
  eyebrow,
  title,
  subtitle,
  action,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-4 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant state-layer m3-focus-ring motion-effects-fast transition-[background-color,color] hover:text-on-surface active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : null}

        {leading ? <div className="shrink-0">{leading}</div> : null}

        <div className="min-w-0 space-y-0.5">
          {(eyebrow ?? backLabel) ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow ?? backLabel}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            // A <div>, not a <p>: detail pages pass a metadata row of badges
            // and facts here, and a <div> inside a <p> is invalid HTML that
            // React silently re-parents, breaking hydration.
            <div className="text-sm text-on-surface-variant sm:text-base">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      ) : null}
    </header>
  );
}
