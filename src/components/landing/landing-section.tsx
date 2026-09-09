import * as React from "react";

import { cn } from "@/lib/utils";

export type LandingTone = "paper" | "sand" | "night";

const GROUND: Record<LandingTone, string> = {
  paper: "bg-lp-paper text-lp-ink",
  sand: "bg-lp-sand text-lp-ink",
  night: "bg-lp-night text-lp-on-night",
};

const RULE: Record<LandingTone, string> = {
  paper: "border-lp-rule",
  sand: "border-lp-rule-firm",
  night: "border-lp-night-rule",
};

const LABEL: Record<LandingTone, string> = {
  paper: "text-lp-ink-faint",
  sand: "text-lp-ink-faint",
  night: "text-lp-on-night-soft",
};

const BODY: Record<LandingTone, string> = {
  paper: "text-lp-ink-soft",
  sand: "text-lp-ink-soft",
  night: "text-lp-on-night-soft",
};

/**
 * The section frame that gives the landing page its rhythm.
 *
 * The header is a **two-column editorial masthead**, not a centred stack: an
 * index-and-label rail on the left, the heading and standfirst on the right.
 * That single decision is most of the difference between this page and the one
 * it replaces, which opened all eight sections with the same centred pill and
 * therefore had no rhythm at all — a reader scrolling it could not tell one
 * section from another without reading the words.
 *
 * The running index (01…06) is the other half of it. It tells the reader how
 * far through the page they are, which a church site needs more than a product
 * site does: most visitors are here for one fact (when is the service, where
 * is the building) and want to know how much is left before they find it. The
 * page computes the numbers rather than passing literals, because three
 * sections disappear when their data or configuration is absent.
 */
export function LandingSection({
  id,
  index,
  label,
  title,
  description,
  aside,
  tone = "paper",
  children,
}: {
  id: string;
  /** Running section number, e.g. "03". Rendered in the left rail. */
  index: string;
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional trailing element in the masthead — usually a single action. */
  aside?: React.ReactNode;
  tone?: LandingTone;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20 border-t", GROUND[tone], RULE[tone])}
    >
      <div className="mx-auto w-full max-w-320 px-6 py-20 sm:px-10 sm:py-28 lg:px-14 lg:py-36">
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
          <div className="flex items-baseline gap-4 lg:col-span-3 lg:flex-col lg:gap-3">
            <span className={cn("lp-label", LABEL[tone])} aria-hidden>
              {index}
            </span>
            <span className={cn("lp-label", LABEL[tone])}>{label}</span>
          </div>

          <div className="lg:col-span-9">
            <h2 className="lp-h2 text-balance">
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "lp-lead mt-5 max-w-xl text-pretty",
                  BODY[tone],
                )}
              >
                {description}
              </p>
            ) : null}
            {aside ? <div className="mt-7">{aside}</div> : null}
          </div>
        </div>

        {children ? <div className="mt-14 sm:mt-20">{children}</div> : null}
      </div>
    </section>
  );
}
