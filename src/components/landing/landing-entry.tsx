import { ArrowRight } from "lucide-react";
import * as React from "react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * One row of an editorial list — a devotional, an event.
 *
 * Both lists share this component rather than each growing its own card
 * because they appear one after the other on the page, and two adjacent lists
 * of the same kind of thing rendered in two different visual languages is
 * exactly the incoherence the redesign is for. The row is a rule, a date, and
 * a headline; the only thing that varies between the two callers is what goes
 * in those slots.
 *
 * The whole row is one anchor, so the hit target is the row and not a 90px
 * "read more" link at the end of it — which matters most on the phone, where
 * most of this congregation will see it.
 */
export function LandingEntry({
  href,
  rail,
  overline,
  title,
  body,
  meta,
  action,
}: {
  href: string;
  /** Fixed-width left block — usually a `<time>` with a big day numeral. */
  rail?: React.ReactNode;
  overline?: React.ReactNode;
  title: string;
  body?: string;
  meta?: React.ReactNode;
  action: string;
}) {
  return (
    <li className="border-b border-lp-rule">
      <Link
        href={href}
        className="group flex gap-5 py-7 transition-colors sm:gap-8 sm:py-8"
      >
        {rail ? <div className="w-20 shrink-0 sm:w-24">{rail}</div> : null}

        <div className="min-w-0 flex-1">
          {overline ? (
            <p className="lp-label text-lp-ink-faint">{overline}</p>
          ) : null}

          <h3
            className={cn(
              "lp-h3 text-pretty text-lp-ink transition-colors group-hover:text-lp-accent",
              overline && "mt-2.5",
            )}
          >
            {title}
          </h3>

          {body ? (
            <p className="lp-body mt-3 max-w-2xl text-pretty text-lp-ink-soft">
              {body}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {meta ? (
              <span className="lp-small text-lp-ink-faint">{meta}</span>
            ) : null}
            <span className="lp-action inline-flex items-center gap-1.5 text-lp-ink">
              <span className="lp-link-group">{action}</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
