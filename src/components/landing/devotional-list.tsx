import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { formatJakarta } from "@/lib/datetime";

import type { DevotionalPublicItem } from "@/server/queries/devotionals";
import type { Locale } from "date-fns";

type Copy = {
  todayLabel: string;
  read: string;
  all: string;
};

/**
 * The landing page's devotional section: one lead reading against a ruled list
 * of the ones before it.
 *
 * A lead-plus-index rather than a row of equal cards, because that is what the
 * content actually is — a newest entry that deserves the headline, and an
 * archive behind it. Three identical cards would say the opposite.
 *
 * Renders nothing when there are no devotionals. An empty state belongs in the
 * admin UI, not on a marketing page: a church that has not published yet is
 * better served by the section simply not existing than by a box explaining
 * that it is empty.
 */
export function DevotionalList({
  items,
  dateLocale,
  copy,
}: {
  items: readonly DevotionalPublicItem[];
  dateLocale: Locale;
  copy: Copy;
}) {
  if (!items.length) return null;
  const [lead, ...rest] = items;
  const dateOf = (d: Date) => formatJakarta(d, "d MMMM yyyy", dateLocale);

  return (
    /* With nothing to index beside it — a church in its first weeks of
     * publishing — the two-column split leaves the right half empty and the
     * section reads as broken rather than as spacious. One devotional gets the
     * full measure instead. */
    <div className="sm-renungan" data-solo={rest.length === 0 || undefined}>
      <Link
        href={`/renungan/${lead.slug}`}
        className="sm-renungan-lead group"
      >
        <p className="sm-label sm-eyebrow">
          {copy.todayLabel}
          <span aria-hidden> · </span>
          {dateOf(lead.publishedAt)}
        </p>
        <h3 className="sm-h2 sm-renungan-lead-title">{lead.title}</h3>

        {lead.verseRef ? (
          <div className="sm-verse">
            <p className="sm-label sm-verse-ref">{lead.verseRef}</p>
            {lead.verseText ? (
              <p className="sm-body sm-verse-text sm-em">
                {excerpt(lead.verseText, 180)}
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="sm-body" style={{ color: "var(--sm-fg-muted)" }}>
          {excerpt(lead.body, 220)}
        </p>

        <span className="sm-action sm-renungan-all">
          {copy.read}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </Link>

      <div>
        {rest.length ? (
          <div className="sm-renungan-more">
            {rest.map((d) => (
              <Link
                key={d.id}
                href={`/renungan/${d.slug}`}
                className="sm-renungan-row"
              >
                <p className="sm-label sm-renungan-row-date">
                  {dateOf(d.publishedAt)}
                  {d.verseRef ? (
                    <>
                      <span aria-hidden> · </span>
                      {d.verseRef}
                    </>
                  ) : null}
                </p>
                <p className="sm-h4 sm-renungan-row-title">{d.title}</p>
                <ArrowRight
                  className="sm-renungan-row-arrow h-4 w-4"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        ) : null}

        <Link href="/renungan" className="sm-link sm-action sm-renungan-all">
          {copy.all}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
