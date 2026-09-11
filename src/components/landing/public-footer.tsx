import { Church } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import { SERVICE_SLOTS, campus, formatAddress } from "@/config/campus";

/**
 * Architectural public footer for GKJ Tangerang.
 *
 * Implements a quiet, editorial, Neo-Grotesque 3-layer architecture:
 * - Layer 1: Church Identity & Theological Confession (Dasar Iman)
 * - Layer 2: Scannable 4-Column Utility (Visit, Contact, Worship Schedule, Links)
 * - Layer 3: Muted Bottom Utility (Copyright & Location)
 */
export async function PublicFooter() {
  const t = await getTranslations("lp");
  const tSchedule = await getTranslations("lp.schedule");

  const secretariatHref = campus.whatsapp
    ? `https://wa.me/${campus.whatsapp}`
    : "";

  const addressText =
    formatAddress() || `${campus.city}, ${campus.region}, ${campus.country}`;

  const scheduleGroups = [
    {
      day: tSchedule("sundayLabel"),
      slots: SERVICE_SLOTS.filter(
        (s) => s.weekday === 0 && s.key !== "sekolahMinggu",
      ).map((slot) => ({
        time: slot.time.replace(":", "."),
        name: t(`schedule.services.${slot.key}.name`),
      })),
    },
    {
      day: tSchedule("wednesdayLabel"),
      slots: SERVICE_SLOTS.filter((s) => s.weekday === 3).map((slot) => ({
        time: slot.time.replace(":", "."),
        name: t(`schedule.services.${slot.key}.name`),
      })),
    },
    {
      day: tSchedule("saturdayLabel"),
      slots: SERVICE_SLOTS.filter((s) => s.weekday === 6).map((slot) => ({
        time: slot.time.replace(":", "."),
        name: t(`schedule.services.${slot.key}.name`),
      })),
    },
  ];

  const usefulLinks = [
    { label: t("footer.portal"), href: "/auth/member", external: false },
    { label: t("footer.staff"), href: "/auth/sign-in", external: false },
    { label: t("footer.giving"), href: "/give", external: false },
    ...(campus.youtubeUrl
      ? [{ label: "YouTube", href: campus.youtubeUrl, external: true }]
      : []),
    ...(campus.instagramUrl
      ? [{ label: "Instagram", href: campus.instagramUrl, external: true }]
      : []),
    ...(campus.facebookUrl
      ? [{ label: "Facebook", href: campus.facebookUrl, external: true }]
      : []),
  ];

  return (
    <footer className="sm-tone-dark sm-footer" aria-label={church.name}>
      <div className="sm-shell">
        {/* ============================================================
         * LAYER 1 — CHURCH IDENTITY & THEOLOGICAL CONFESSION
         * ============================================================ */}
        <div className="sm-footer-identity-row">
          <div className="sm-footer-brand-wrap">
            <Image
              src="/landing-page/crest-lg.png"
              alt=""
              aria-hidden="true"
              width={364}
              height={512}
              className="sm-footer-crest"
            />
            <div className="sm-footer-brand-text">
              <h2 className="sm-footer-brand-name">
                <span className="sm-footer-brand-line">{church.nameLine1}</span>
                <span className="sm-footer-brand-line">{church.nameLine2}</span>
              </h2>
            </div>
          </div>

          <div className="sm-footer-faith">
            <p className="sm-footer-label">{t("footer.faithLabel")}</p>
            <p className="sm-footer-faith-body">{t("footer.faithBody")}</p>
            <p className="sm-footer-faith-verse">{t("footer.faithVerse")}</p>
          </div>
        </div>

        {/* ============================================================
         * LAYER 2 — UTILITY GRID (4 COLUMNS)
         * ============================================================ */}
        <div className="sm-footer-grid sm-rule-t">
          {/* Col 1: Kunjungi Kami */}
          <div className="sm-footer-col sm-footer-col-visit">
            <h3 className="sm-footer-label">{t("footer.visitLabel")}</h3>
            <div className="sm-footer-block">
              <p className="sm-footer-primary">{church.nameLine1}</p>
              <p className="sm-footer-primary">{church.nameLine2}</p>
              <p className="sm-footer-secondary sm-footer-address">
                {addressText}
              </p>
            </div>
            <a
              href={campus.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-footer-action"
            >
              <span>{t("footer.openMaps")}</span>
              <span className="sm-footer-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>

          {/* Col 2: Hubungi Kami */}
          <div className="sm-footer-col sm-footer-col-contact">
            <h3 className="sm-footer-label">{t("footer.contactLabel")}</h3>
            <div className="sm-footer-block">
              {secretariatHref ? (
                <a
                  href={secretariatHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-footer-link sm-footer-primary"
                >
                  {t("footer.whatsappLabel")}
                </a>
              ) : (
                <span className="sm-footer-primary">
                  {t("footer.whatsappLabel")}
                </span>
              )}
            </div>

            <div className="sm-footer-block sm-footer-hours-block">
              <p className="sm-footer-label-sub">{t("footer.hoursLabel")}</p>
              <p className="sm-footer-secondary">{t("footer.hoursDays")}</p>
              <p className="sm-footer-secondary">{t("footer.hoursTime")}</p>
            </div>
          </div>

          {/* Col 3: Jadwal Ibadah */}
          <div className="sm-footer-col sm-footer-col-schedule">
            <h3 className="sm-footer-label">{t("footer.scheduleLabel")}</h3>
            <div className="sm-footer-schedule-groups">
              {scheduleGroups.map((group) => (
                <div key={group.day} className="sm-footer-schedule-group">
                  <p className="sm-footer-primary sm-footer-day">{group.day}</p>
                  <ul className="sm-footer-schedule-list" role="list">
                    {group.slots.map((slot) => (
                      <li
                        key={`${group.day}-${slot.time}-${slot.name}`}
                        className="sm-footer-secondary sm-footer-schedule-item"
                      >
                        <span className="sm-footer-time">{slot.time}</span>
                        <span className="sm-footer-dot" aria-hidden="true">
                          ·
                        </span>
                        <span className="sm-footer-service-name">
                          {slot.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link href="/#rencanakan" className="sm-footer-action">
              <span>{t("footer.viewSchedule")}</span>
              <span className="sm-footer-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          {/* Col 4: Tautan */}
          <div className="sm-footer-col sm-footer-col-links">
            <h3 className="sm-footer-label">{t("footer.linksLabel")}</h3>
            <ul className="sm-footer-nav-list" role="list">
              {usefulLinks.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-footer-link sm-footer-primary"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="sm-footer-link sm-footer-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ============================================================
         * LAYER 3 — BOTTOM UTILITY
         * ============================================================ */}
        <div className="sm-footer-base sm-rule-t">
          <p className="sm-footer-copyright">
            © {new Date().getFullYear()} {church.name}.{" "}
            {t("footer.rights")}
          </p>
          <p className="sm-footer-location">
            <Church className="sm-footer-location-icon" aria-hidden="true" />
            <span>
              {campus.city.toUpperCase()} · {campus.region.toUpperCase()}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
