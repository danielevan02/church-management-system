import { Church } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import {
  SERVICE_SLOTS,
  campus,
  formatAddress,
  fullSchedule,
} from "@/config/campus";
import { dateFnsLocale, formatJakarta } from "@/lib/datetime";

/**
 * The architectural footer, shared by the landing page and every public
 * devotional page.
 *
 * A server component with no props: it reads the church config and the
 * translations itself, so a new public route gets the complete legal name,
 * address, secretariat hours, service times and statement of faith by
 * rendering one element. Duplicating 130 lines of footer per route is how
 * those facts start disagreeing with each other.
 */
export async function PublicFooter() {
  const t = await getTranslations("lp");
  const locale = await getLocale();
  const df = dateFnsLocale(locale);
  const schedule = fullSchedule();
  const secretariatHref = campus.whatsapp
    ? `https://wa.me/${campus.whatsapp}`
    : "";
  const weekdayOf = (iso: string) =>
    t("schedule.every", { day: formatJakarta(new Date(iso), "EEEE", df) });

  return (
    <footer className="sm-tone-dark sm-footer" aria-label={church.name}>
      <div className="sm-shell">
        <div className="sm-footer-top">
          <div className="sm-footer-identity">
            <Image
              src="/landing-page/crest-lg.png"
              alt=""
              aria-hidden
              width={364}
              height={512}
              className="sm-footer-crest"
            />
            <div className="flex flex-col gap-2">
              <p className="sm-label sm-eyebrow">
                {t("footer.legalLabel")}
              </p>
              <p className="sm-h3">{church.name}</p>
            </div>
          </div>

          <div className="sm-footer-faith">
            <p className="sm-label sm-eyebrow">{t("footer.faithLabel")}</p>
            <p className="sm-body" style={{ color: "var(--sm-fg-muted)" }}>
              {t("footer.faithBody")}
            </p>
            <p className="sm-label sm-footer-verse">
              {t("footer.faithVerse")}
            </p>
          </div>
        </div>

        <div className="sm-footer-grid sm-rule-t">
          <div className="sm-footer-col">
            <p className="sm-label sm-eyebrow">
              {t("footer.addressLabel")}
            </p>
            <p className="sm-small">{campus.signage}</p>
            <p className="sm-small" style={{ color: "var(--sm-fg-muted)" }}>
              {formatAddress()}
            </p>
            <a
              href={campus.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-small sm-link-muted"
            >
              {t("schedule.route")}
            </a>
          </div>

          <div className="sm-footer-col">
            <p className="sm-label sm-eyebrow">
              {t("footer.contactLabel")}
            </p>
            {secretariatHref ? (
              <a
                href={secretariatHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sm-small sm-link-muted"
              >
                {t("footer.whatsappLabel")}
              </a>
            ) : null}
            {campus.email ? (
              <a
                href={`mailto:${campus.email}`}
                className="sm-small sm-link-muted"
              >
                {campus.email}
              </a>
            ) : null}
            <p className="sm-label sm-eyebrow sm-footer-sub">
              {t("footer.hoursLabel")}
            </p>
            <p className="sm-small" style={{ color: "var(--sm-fg-muted)" }}>
              {t("footer.hours")}
            </p>
          </div>

          <div className="sm-footer-col">
            <p className="sm-label sm-eyebrow">
              {t("schedule.label")}
            </p>
            {SERVICE_SLOTS.map((slot, i) => (
              <p key={slot.key} className="sm-small sm-footer-service">
                <span style={{ color: "var(--sm-fg)" }}>
                  {t(`schedule.services.${slot.key}.name`)}
                </span>
                <span style={{ color: "var(--sm-fg-muted)" }}>
                  {weekdayOf(schedule[i].startsAtIso)}
                  {", "}
                  {formatJakarta(
                    new Date(schedule[i].startsAtIso),
                    "HH.mm",
                  )}
                </span>
              </p>
            ))}
          </div>

          <div className="sm-footer-col">
            <p className="sm-label sm-eyebrow">
              {t("footer.accessLabel")}
            </p>
            <Link href="/auth/member" className="sm-small sm-link-muted">
              {t("footer.portal")}
            </Link>
            <Link href="/auth/sign-in" className="sm-small sm-link-muted">
              {t("footer.staff")}
            </Link>
            <Link href="/give" className="sm-small sm-link-muted">
              {t("giving.label")}
            </Link>
            <a
              href={campus.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-small sm-link-muted"
            >
              YouTube
            </a>
            <a
              href={campus.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-small sm-link-muted"
            >
              Instagram
            </a>
            <a
              href={campus.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-small sm-link-muted"
            >
              Facebook
            </a>
          </div>
        </div>

        <div className="sm-footer-base sm-rule-t">
          <p className="sm-small" style={{ color: "var(--sm-fg-faint)" }}>
            © {new Date().getFullYear()} {church.name}.{" "}
            {t("footer.rights")}
          </p>
          <p className="sm-label sm-eyebrow inline-flex items-center gap-2">
            <Church className="h-3.5 w-3.5" aria-hidden />
            {t("hero.location")}
          </p>
        </div>
      </div>
    </footer>
  );
}
