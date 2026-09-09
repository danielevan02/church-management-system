import { getLocale, getTranslations } from "next-intl/server";

import { LandingEntry } from "@/components/landing/landing-entry";
import { LandingSection } from "@/components/landing/landing-section";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";

/**
 * Upcoming events, in the same row language as the devotional list directly
 * above it — see `LandingEntry` for why they share one component.
 *
 * There is no public event detail route, so a row opens sign-in. Registration
 * has always lived in the member portal; the row says so rather than
 * implying a public RSVP that does not exist.
 */
export async function LandingEvents({
  events,
  index,
}: {
  events: {
    id: string;
    title: string;
    startsAt: Date;
    endsAt: Date;
    location: string | null;
  }[];
  index: string;
}) {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const df = dateFnsLocale(locale);

  return (
    <LandingSection
      id="agenda"
      index={index}
      label={t("nav.events")}
      title={t("events.title")}
      description={t("events.description")}
    >
      <ul className="lp-reveal border-t border-lp-ink">
        {events.map((event) => {
          const time = formatJakarta(event.startsAt, "HH.mm", df);
          return (
            <LandingEntry
              key={event.id}
              href="/auth/member"
              rail={
                <time dateTime={event.startsAt.toISOString()} className="block">
                  <span className="lp-num-sm block text-lp-ink">
                    {formatJakarta(event.startsAt, "d", df)}
                  </span>
                  <span className="lp-label mt-1.5 block text-lp-ink-faint">
                    {formatJakarta(event.startsAt, "MMM yyyy", df)}
                  </span>
                </time>
              }
              overline={formatJakarta(event.startsAt, "EEEE", df)}
              title={event.title}
              meta={[t("events.at", { time }), event.location]
                .filter(Boolean)
                .join(" · ")}
              action={t("events.detailCta")}
            />
          );
        })}
      </ul>
    </LandingSection>
  );
}
