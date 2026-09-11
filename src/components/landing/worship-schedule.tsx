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

function CalendarLink({
  href,
  serviceName,
  label,
}: {
  href: string;
  serviceName: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="sm-worship-cal-link group"
      aria-label={`${label}: ${serviceName}`}
    >
      <Calendar
        className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform group-hover:scale-110"
        aria-hidden="true"
      />
      <span>{label}</span>
      <ArrowUpRight
        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

export async function WorshipSchedule() {
  const t = await getTranslations("lp.schedule");
  const locale = await getLocale();

  // Primary Sunday Services (Visual Anchor 1)
  const sundayKeys = ["umumEarly", "umumLate", "tyog"] as const;
  const sundaySlots = sundayKeys
    .map((key) => SERVICE_SLOTS.find((s) => s.key === key))
    .filter((s): s is ServiceSlot => Boolean(s));

  // Other Weekly Services (Visual Anchor 2)
  const otherConfig = [
    { key: "doa", dayKey: "wednesdayLabel" as const },
    { key: "yifalian", dayKey: "saturdayLabel" as const },
  ];
  const otherSlots = otherConfig
    .map(({ key, dayKey }) => {
      const slot = SERVICE_SLOTS.find((s) => s.key === key);
      return slot ? { slot, dayKey } : null;
    })
    .filter(
      (
        item,
      ): item is {
        slot: ServiceSlot;
        dayKey: "wednesdayLabel" | "saturdayLabel";
      } => Boolean(item),
    );

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
         * BENTO GRID — High Contrast Asymmetric Visual Rhythm
         * ============================================================ */}
        <div className="sm-worship-bento">
          {/* ────────────────────────────────────────────────────────────
           * CELL 1: DOMINANT SUNDAY HERO CELL (Span 8)
           * ──────────────────────────────────────────────────────────── */}
          <article
            className="sm-worship-cell sm-worship-cell-sunday"
            data-sm-reveal="fade"
          >
            <div className="sm-worship-cell-header">
              <div className="sm-worship-badge-group">
                <span className="sm-worship-day-tag">
                  <Radio className="h-3 w-3 animate-pulse text-amber-400" />
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
                  title: `${church.name} — ${serviceName}`,
                  slot,
                  details: `${t("calendarTitle", { church: church.name })}\n\n${campus.mapsUrl}`,
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
                      <h4 className="sm-worship-service-name">
                        {serviceName}
                      </h4>
                      {englishNote && englishNote !== serviceName && (
                        <p className="sm-worship-lang-hint">{englishNote}</p>
                      )}
                      <p className="sm-worship-audience">{audienceNote}</p>
                    </div>

                    {/* Meta & Calendar Link */}
                    <div className="sm-worship-action-row">
                      <span className="sm-worship-duration">
                        {slot.durationMin} {t("duration")}
                      </span>
                      <CalendarLink
                        href={calUrl}
                        serviceName={serviceName}
                        label={t("addToCalendar")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* ────────────────────────────────────────────────────────────
           * CELL 2: ATMOSPHERE PHOTO TILE (Span 4)
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
                sizes="(max-width: 62rem) 100vw, 33vw"
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
                {church.shortName}
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
            const audienceNote = t(`services.${slot.key}.audience`);
            const englishNote =
              locale === "en"
                ? t(`services.${slot.key}.englishNote`)
                : null;
            const dayName = t(dayKey);

            const calUrl = googleCalendarUrl({
              title: `${church.name} — ${serviceName}`,
              slot,
              details: `${t("calendarTitle", { church: church.name })}\n\n${campus.mapsUrl}`,
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
                  <CalendarLink
                    href={calUrl}
                    serviceName={serviceName}
                    label={t("addToCalendar")}
                  />
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
