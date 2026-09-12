import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { church } from "@/config/church";
import {
  SERVICE_SLOTS,
  campus,
  formatAddress,
  googleCalendarUrl,
  type ServiceSlot,
} from "@/config/campus";

const SANCTUARY_PHOTO = "/landing-page/gathering.jpeg";

/**
 * The services listed under one day heading.
 *
 * Grouped by day rather than split across tiles by importance: a reader
 * scanning for "when can I come" is scanning by day, and a timetable that
 * answers that question in its own structure needs no card to frame it.
 * Sekolah Minggu is deliberately absent — it runs parallel to Kebaktian Umum
 * II and listing it as its own row implies a third Sunday service.
 */
const SCHEDULE_GROUPS = [
  { dayKey: "sundayLabel", keys: ["umumEarly", "umumLate", "tyog"] },
  { dayKey: "wednesdayLabel", keys: ["doa"] },
] as const;

export async function WorshipSchedule() {
  const t = await getTranslations("lp.schedule");
  const locale = await getLocale();

  const groups = SCHEDULE_GROUPS.map(({ dayKey, keys }) => ({
    dayKey,
    day: t(dayKey),
    slots: keys
      .map((key) => SERVICE_SLOTS.find((s) => s.key === key))
      .filter((s): s is ServiceSlot => Boolean(s)),
  })).filter((group) => group.slots.length > 0);

  const address = formatAddress();

  return (
    <section
      id="ibadah"
      className="sm-tone-dark sm-worship-section sm-section"
      aria-labelledby="sm-schedule-heading"
    >
      <div className="sm-shell">
        <header
          className="sm-worship-header"
          data-sm-reveal="fade"
          data-sm-trigger="#atas"
          data-sm-start="bottom 58%"
        >
          <p className="sm-worship-kicker">{t("label")}</p>
          <h2 id="sm-schedule-heading" className="sm-worship-title">
            {t("title")}
          </h2>
          <p className="sm-worship-lead">{t("lead")}</p>
        </header>

        <div className="sm-worship-layout">
          {/* ============================================================
           * THE TIMETABLE — one hairline per service, no shells.
           * ============================================================ */}
          <div className="sm-worship-table" data-sm-stagger>
            {groups.map((group) => (
              <div key={group.dayKey} className="sm-worship-group">
                <div className="sm-worship-group-head">
                  <span className="sm-worship-day">{group.day}</span>
                  <span className="sm-worship-room">
                    {t(`services.${group.slots[0].key}.room`)}
                  </span>
                </div>

                {group.slots.map((slot) => {
                  const serviceName = t(`services.${slot.key}.name`);
                  const englishNote =
                    locale === "en" ? t(`services.${slot.key}.englishNote`) : null;
                  const calUrl = googleCalendarUrl({
                    title: `${church.name} — ${serviceName}`,
                    slot,
                    details: `${t("calendarTitle", { church: church.name })}\n\n${campus.mapsUrl}`,
                  });

                  return (
                    <div
                      key={slot.key}
                      className="sm-worship-row"
                      data-sm-reveal="up"
                    >
                      <div className="sm-worship-row-time">
                        <span className="sm-worship-time">
                          {slot.time.replace(":", ".")}
                        </span>
                        <span className="sm-worship-tz">WIB</span>
                      </div>

                      <div className="sm-worship-row-body">
                        <h3 className="sm-worship-service-name">{serviceName}</h3>
                        {englishNote && englishNote !== serviceName && (
                          <p className="sm-worship-lang-hint">{englishNote}</p>
                        )}
                        <p className="sm-worship-audience">
                          {t(`services.${slot.key}.audience`)}
                        </p>
                      </div>

                      <div className="sm-worship-row-meta">
                        <span className="sm-worship-duration">
                          {slot.durationMin} {t("duration")}
                        </span>
                        <a
                          href={calUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm-worship-cal-link"
                          aria-label={`${t("addToCalendar")}: ${serviceName}`}
                        >
                          <span>{t("addToCalendar")}</span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ============================================================
           * THE RAIL — the two objects: the room, and where it is.
           * ============================================================ */}
          <aside className="sm-worship-rail">
            <figure className="sm-worship-plate" data-sm-reveal="fade">
              <div className="sm-parallax" data-sm-parallax>
                <Image
                  src={SANCTUARY_PHOTO}
                  alt={t("sanctuaryCaption")}
                  fill
                  sizes="(max-width: 62rem) 100vw, 33vw"
                  quality={82}
                  className="sm-worship-photo"
                />
              </div>
              <div className="sm-worship-photo-overlay" aria-hidden="true" />
              <figcaption className="sm-worship-photo-caption">
                <span className="sm-worship-photo-badge">
                  {church.shortName}
                </span>
                <p className="sm-worship-photo-text">
                  {t("sanctuaryCaption")}
                </p>
              </figcaption>
            </figure>

            <div className="sm-worship-place" data-sm-reveal="up">
              <p className="sm-worship-place-label">{t("campusLabel")}</p>
              <h3 className="sm-worship-campus-name">
                {campus.signage || church.name}
              </h3>
              <p className="sm-worship-campus-address">{address}</p>

              <div className="sm-worship-place-actions">
                <a
                  href={campus.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-worship-place-btn"
                >
                  <span>{t("route")}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>

                {campus.livestreamUrl && (
                  <a
                    href={campus.livestreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-worship-livestream-link"
                  >
                    <span className="sm-worship-live-dot" aria-hidden="true" />
                    <span>{t("livestream")}</span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
