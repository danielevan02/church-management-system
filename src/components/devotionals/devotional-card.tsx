import { ArrowRight, BookOpen } from "lucide-react";

import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/**
 * The devotional card, shared by the member dashboard and the public landing
 * page.
 *
 * It exists because those two had drifted into separate implementations of the
 * same object: the dashboard's was a `surface-container-low` card with a small
 * verse chip, and the landing page's had grown a `tone="gradient"` ground, a
 * `border-l-4` pull-quote and a `h-52` watermark. Same content, two designs,
 * and the landing one also dropped the `overflow-hidden` that keeps the
 * watermark inside the card — which is why its book mark spilled past the
 * corner and read as a rendering fault.
 *
 * The card is deliberately presentational and takes its labels as props. That
 * is what lets it serve both contexts without importing either one's
 * translation namespace, and it keeps the component out of the client bundle
 * when a Server Component renders it.
 *
 * `href` is a parameter for the same reason: on the dashboard it opens the
 * devotional, and on the public page it goes to sign-in, because there is no
 * public devotional route and inventing one would put member content behind a
 * guessable URL.
 */
export type DevotionalCardProps = {
  devotional: {
    id: string;
    title: string;
    verseRef: string | null;
    body: string;
    authorName: string | null;
    publishedAt: Date;
  };
  href: string;
  labels: { badge: string; read: string };
  className?: string;
};

export function DevotionalCard({
  devotional,
  href,
  labels,
  className,
}: DevotionalCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${labels.badge}: ${devotional.title}`}
      className={cn(
        "group relative block h-full overflow-hidden rounded-3xl bg-surface-container-low p-5 shadow-level-0 sm:p-6",
        "motion-effects-fast transition-[background-color,box-shadow,transform]",
        "hover:bg-surface-container hover:shadow-level-1 active:scale-[0.99]",
        "m3-focus-ring",
        className,
      )}
    >
      <BookOpen
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-4 h-32 w-32 select-none text-primary/[0.04] transition-transform duration-300 group-hover:scale-110"
      />
      <div className="relative flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {labels.badge}
          </span>
          <span className="text-xs font-medium text-on-surface-variant">
            {formatJakarta(devotional.publishedAt, "dd MMM yyyy")}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-xl">
            {devotional.title}
          </h3>
          {devotional.verseRef || devotional.authorName ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {devotional.verseRef ? (
                <span className="inline-flex items-center rounded-md bg-surface-container px-2 py-0.5 font-semibold text-primary">
                  {devotional.verseRef}
                </span>
              ) : null}
              {devotional.authorName ? (
                <span className="text-on-surface-variant">
                  — {devotional.authorName}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant sm:line-clamp-3 sm:text-sm">
          {excerpt(devotional.body, 180)}
        </p>

        <div className="pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
            {labels.read}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
