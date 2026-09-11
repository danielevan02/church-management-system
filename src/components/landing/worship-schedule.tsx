import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Calendar, MapPin, Radio } from "lucide-react";

import { church } from "@/config/church";
import {
  SERVICE_SLOTS,
  campus,
  formatAddress,
  googleCalendarUrl,
  type ServiceSlot,
} from "@/config/campus";

const SANCTUARY_PHOTO = "/landing-page/gathering.jpeg";

export async function WorshipSchedule() {
  const t = await getTranslations("lp.schedule");
  const locale = await getLocale();

  // Primary Sunday Services (Visual Anchor 1)
  const sundaySlots: ServiceSlot[] = [
    SERVICE_SLOTS.find((s) => s.key === "umumEarly")!,
    SERVICE_SLOTS.find((s) => s.key === "umumLate")!,
    SERVICE_SLOTS.find((s) => s.key === "tyog")!,
  ].filter(Boolean);

  // Other Weekly Services (Visual Anchor 2)
  const otherSlots = [
    {
      slot: SERVICE_SLOTS.find((s) => s.key === "doa")!,
      dayKey: "wednesdayLabel" as const,
    },
    {
      slot: SERVICE_SLOTS.find((s) => s.key === "yifalian")!,
      dayKey: "saturdayLabel" as const,
    },
  ].filter((item) => Boolean(item.slot));

  const address = formatAddress();

  return (
    <section
      id="ibadah"
      className="sm-tone-dark sm-worship-section sm-section"
      aria-labelledby="sm-schedule-heading"
    >
      <div className="sm-shell">
        {/* ============================================================
         * SECTION HEADER — Editorial Neo-Grotesque
         * ============================================================ */}
        <header
          className="sm-worship-header"
          data-sm-reveal="fade"
          data-sm-trigger="#atas"
          data-sm-start="bottom 58%"
        >
          <div className="sm-worship-header-body">
            <h2 id="sm-schedule-heading" className="sm-worship-title">
              {t("title")}
            </h2>
            <p className="sm-worship-lead">{t("lead")}</p>
          </div>
        </header>

        {/* ============================================================
         * BENTO GRID COMPOSITION
         * ============================================================ */}
        <div
          className="sm-worship-bento"
          data-sm-stagger
          data-sm-trigger="#atas"
          data-sm-start="bottom 50%"
        >
          {/* ────────────────────────────────────────────────────────────
           * CELL 1: DOMINANT SUNDAY ANCHOR (Desktop: 8-col / 2-row)
           * ──────────────────────────────────────────────────────────── */}
          <article
            className="sm-worship-cell sm-worship-cell-sunday"
            data-sm-reveal="fade"
          >
            {/* Cell Meta Header */}
            <div className="sm-worship-cell-header">
              <div className="sm-worship-badge-group">
                <span className="sm-worship-day-tag">
                  {t("sundayLabel")}
                </span>
                <span className="sm-worship-meta-divider" aria-hidden="true">
                  /
                </span>
                <span className="sm-worship-meta-sub">
                  {t("mainSunday")}
                </span>
              </div>
              <span className="sm-worship-meta-room">
                {t("sanctuaryRoom")}
              </span>
            </div>

            {/* Sunday 3-Column Service Shelf */}
            <div className="sm-worship-sunday-grid">
              {sundaySlots.map((slot) => {
                const serviceName = t(`services.${slot.key}.name`);
                const englishNote =
                  locale === "en"
                    ? t(`services.${slot.key}.englishNote`)
                    : null;
                const audienceNote = t(`services.${slot.key}.audience`);
                const calUrl = googleCalendarUrl({
                  title: `${serviceName} — ${church.shortName}`,
                  slot,
                  details: t("calendarTitle", { church: church.name }),
                });

                return (
                  <div
                    key={slot.key}
                    className="sm-worship-sunday-item"
                    data-slot={slot.key}
                  >
                    {/* Time (Display Neo-Grotesque) */}
                    <div className="sm-worship-time-wrap">
                      <span className="sm-worship-time">
                        {slot.time.replace(":", ".")}
                      </span>
                      <span className="sm-worship-tz">WIB</span>
                    </div>

                    {/* Service Information */}
                    <div className="sm-worship-service-info">
                      <h3 className="sm-worship-service-name">
                        {serviceName}
                      </h3>
                      {englishNote && englishNote !== serviceName && (
                        <p className="sm-worship-lang-hint">
                          {englishNote}
                        </p>
                      )}
                      <p className="sm-worship-audience">{audienceNote}</p>
                    </div>

                    {/* Meta & Calendar Link */}
                    <div className="sm-worship-action-row">
                      <span className="sm-worship-duration">
                        {slot.durationMin} {t("duration")}
                      </span>
                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-worship-cal-link group"
                        aria-label={`${t("addToCalendar")}: ${serviceName}`}
                      >
                        <Calendar
                          className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform group-hover:scale-110"
                          aria-hidden="true"
                        />
                        <span>{t("addToCalendar")}</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* ────────────────────────────────────────────────────────────
           * CELL 2: SANCTUARY ATMOSPHERE (Desktop: 4-col)
           * ──────────────────────────────────────────────────────────── */}
          <aside
            className="sm-worship-cell sm-worship-cell-photo"
            data-sm-reveal="fade"
          >
            <div className="sm-worship-photo-wrap">
              <Image
                src={SANCTUARY_PHOTO}
                alt={t("sanctuaryCaption")}
                fill
                sizes="(max-width: 64rem) 100vw, 33vw"
                quality={82}
                className="sm-worship-photo"
              />
              <div
                className="sm-worship-photo-overlay"
                aria-hidden="true"
              />
            </div>
            <div className="sm-worship-photo-caption">
              <span className="sm-worship-photo-badge">
                GKJ Tangerang
              </span>
              <p className="sm-worship-photo-text">
                {t("sanctuaryCaption")}
              </p>
            </div>
          </aside>

          {/* ────────────────────────────────────────────────────────────
           * CELL 3 & 4: MIDWEEK & SATURDAY SERVICES
           * ──────────────────────────────────────────────────────────── */}
          {otherSlots.map(({ slot, dayKey }) => {
            const serviceName = t(`services.${slot.key}.name`);
            const englishNote =
              locale === "en"
                ? t(`services.${slot.key}.englishNote`)
                : null;
            const audienceNote = t(`services.${slot.key}.audience`);
            const dayName = t(dayKey);
            const calUrl = googleCalendarUrl({
              title: `${serviceName} — ${church.shortName}`,
              slot,
              details: t("calendarTitle", { church: church.name }),
            });

            return (
              <article
                key={slot.key}
                className="sm-worship-cell sm-worship-cell-secondary"
                data-sm-reveal="fade"
              >
                <div className="sm-worship-cell-header">
                  <span className="sm-worship-day-tag">{dayName}</span>
                  <span className="sm-worship-duration">
                    {slot.durationMin} {t("duration")}
                  </span>
                </div>

                <div className="sm-worship-time-wrap">
                  <span className="sm-worship-time sm-worship-time-sm">
                    {slot.time.replace(":", ".")}
                  </span>
                  <span className="sm-worship-tz">WIB</span>
                </div>

                <div className="sm-worship-service-info">
                  <h3 className="sm-worship-service-name">
                    {serviceName}
                  </h3>
                  {englishNote && englishNote !== serviceName && (
                    <p className="sm-worship-lang-hint">{englishNote}</p>
                  )}
                  <p className="sm-worship-audience">{audienceNote}</p>
                </div>

                <div className="sm-worship-secondary-bottom">
                  <a
                    href={calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-worship-cal-link group"
                    aria-label={`${t("addToCalendar")}: ${serviceName}`}
                  >
                    <Calendar
                      className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span>{t("addToCalendar")}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            );
          })}

          {/* ────────────────────────────────────────────────────────────
           * CELL 5: CHURCH LOCATION & DIRECTION
           * ──────────────────────────────────────────────────────────── */}
          <aside
            className="sm-worship-cell sm-worship-cell-location"
            data-sm-reveal="fade"
          >
            <div className="sm-worship-cell-header">
              <span className="sm-worship-day-tag">
                {t("campusLabel")}
              </span>
              <MapPin
                className="h-4 w-4 text-[var(--sm-accent-display)]"
                aria-hidden="true"
              />
            </div>

            <div className="sm-worship-location-body">
              <h3 className="sm-worship-campus-name">
                {campus.signage || church.name}
              </h3>
              <p className="sm-worship-campus-address">{address}</p>
            </div>

            <div className="sm-worship-location-actions">
              <a
                href={campus.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm-btn sm-btn-primary sm-worship-maps-btn group"
              >
                <span>{t("route")}</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>

              {campus.livestreamUrl && (
                <a
                  href={campus.livestreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-worship-livestream-link group"
                >
                  <Radio
                    className="h-3.5 w-3.5 shrink-0 text-red-400 transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span>{t("livestream")}</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
