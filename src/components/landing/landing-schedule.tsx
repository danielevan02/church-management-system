import { getLocale, getTranslations } from "next-intl/server";

import { LandingSection } from "@/components/landing/landing-section";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";

type UpcomingService = {
  id: string;
  name: string;
  startsAt: Date;
  location: string | null;
};

/**
 * "Plan your visit" — the section the hero's timetable makes room for.
 *
 * The hero already answers *what time on Sunday*, so this section deliberately
 * does not repeat the weekly grid: an earlier draft fell back to printing the
 * three service times again whenever the database had no special services
 * scheduled, which put the same three rows on screen twice inside one scroll.
 * What a first-time visitor needs next is not the times again — it is to know
 * what walking in will be like.
 *
 * The dated list below the reassurances appears only when there is something
 * dated to show. An empty-state card saying "no upcoming services" would be a
 * worse answer than not raising the question.
 */
export async function LandingSchedule({
  upcoming,
  index,
}: {
  upcoming: UpcomingService[];
  index: string;
}) {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const df = dateFnsLocale(locale);

  const notes = [1, 2, 3].map((n) => ({
    title: t(`schedule.note${n}.title`),
    body: t(`schedule.note${n}.body`),
  }));

  return (
    <LandingSection
      id="jadwal"
      index={index}
      label={t("nav.schedule")}
      title={t("schedule.title")}
      description={t("schedule.description")}
    >
      <div className="lp-reveal">
        <h3 className="lp-label border-b border-lp-ink pb-3 text-lp-ink">
          {t("schedule.firstTimeTitle")}
        </h3>

        <div className="grid border-b border-lp-rule sm:grid-cols-3 sm:gap-x-10">
          {notes.map((note, i) => (
            <div
              key={note.title}
              className="border-b border-lp-rule py-8 last:border-b-0 sm:border-b-0"
            >
              <span
                className="lp-label block text-lp-ink-faint"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="lp-h3 mt-4 text-pretty text-lp-ink">
                {note.title}
              </p>
              <p className="mt-3 max-w-xs lp-body text-pretty text-lp-ink-soft">
                {note.body}
              </p>
            </div>
          ))}
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-16 grid gap-x-10 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h3 className="lp-label text-lp-ink">
                {t("schedule.upcomingTitle")}
              </h3>
              <p className="lp-small mt-4 max-w-xs text-lp-ink-faint">
                {t("schedule.upcomingDescription")}
              </p>
            </div>

            <ul className="border-t border-lp-ink lg:col-span-9">
              {upcoming.map((service) => (
                <li
                  key={service.id}
                  className="flex items-baseline gap-5 border-b border-lp-rule py-5 sm:gap-8"
                >
                  <time
                    dateTime={service.startsAt.toISOString()}
                    className="w-20 shrink-0 sm:w-24"
                  >
                    <span className="lp-num-sm block text-lp-ink">
                      {formatJakarta(service.startsAt, "d", df)}
                    </span>
                    <span className="lp-label mt-1.5 block text-lp-ink-faint">
                      {formatJakarta(service.startsAt, "MMM yyyy", df)}
                    </span>
                  </time>

                  <div className="min-w-0 flex-1">
                    <p className="lp-body font-medium text-lp-ink">
                      {service.name}
                    </p>
                    {service.location ? (
                      <p className="lp-small mt-0.5 truncate text-lp-ink-faint">
                        {service.location}
                      </p>
                    ) : null}
                  </div>

                  <span className="lp-small shrink-0 font-semibold tabular-nums text-lp-ink-soft">
                    {formatJakarta(service.startsAt, "HH.mm", df)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </LandingSection>
  );
}
