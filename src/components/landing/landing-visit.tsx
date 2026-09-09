import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LandingSection } from "@/components/landing/landing-section";
import { church } from "@/config/church";

/**
 * Whether there is anything to put in the Visit section.
 *
 * Called by the page so the section, its nav entry and its running number all
 * disappear together when the deployment has not been given an address.
 */
export function hasVisitInfo(): boolean {
  const c = church.contact;
  return Boolean(
    c.address || c.city || c.phone || c.whatsapp || c.email || c.mapsQuery,
  );
}

/**
 * Location and contact.
 *
 * Contact rows are a definition list on hairlines rather than a stack of
 * bordered tiles with an icon in a rounded square each — six tiles is six
 * boxes competing with a map that is itself a box. The icons are gone
 * entirely: "Alamat", "Telepon" and "Email" are already the clearest possible
 * labels for what they label, and a pin glyph beside the word "Alamat" is
 * decoration pretending to be wayfinding.
 */
export async function LandingVisit({ index }: { index: string }) {
  const t = await getTranslations("landing");
  const {
    address,
    city,
    mapsUrl,
    mapsQuery,
    phone,
    whatsapp,
    email,
    instagram,
    youtube,
  } = church.contact;

  const rows = [
    address || city
      ? {
          key: "address",
          label: t("visit.addressLabel"),
          value: [address, city].filter(Boolean).join(", "),
          href: mapsUrl || undefined,
        }
      : null,
    whatsapp
      ? {
          key: "whatsapp",
          label: t("visit.whatsappLabel"),
          value: `+${whatsapp}`,
          href: `https://wa.me/${whatsapp}`,
        }
      : null,
    phone
      ? {
          key: "phone",
          label: t("visit.phoneLabel"),
          value: phone,
          href: `tel:${phone}`,
        }
      : null,
    email
      ? {
          key: "email",
          label: t("visit.emailLabel"),
          value: email,
          href: `mailto:${email}`,
        }
      : null,
    instagram
      ? {
          key: "instagram",
          label: t("visit.instagramLabel"),
          value: instagram.replace(/^https?:\/\/(www\.)?/, ""),
          href: instagram,
        }
      : null,
    youtube
      ? {
          key: "youtube",
          label: t("visit.youtubeLabel"),
          value: youtube.replace(/^https?:\/\/(www\.)?/, ""),
          href: youtube,
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  const embedSrc = mapsQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`
    : null;

  return (
    <LandingSection
      id="kunjungi"
      index={index}
      label={t("nav.visit")}
      title={t("visit.title")}
      description={t("visit.description")}
    >
      <div className="lp-reveal grid gap-x-10 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h3 className="lp-label border-b border-lp-ink pb-3 text-lp-ink">
            {t("visit.contactTitle")}
          </h3>

          <dl>
            {rows.map((row) => (
              <div key={row.key} className="border-b border-lp-rule py-5">
                <dt className="lp-label text-lp-ink-faint">{row.label}</dt>
                <dd className="lp-body mt-2 text-lp-ink">
                  {row.href ? (
                    <a
                      href={row.href}
                      target={
                        row.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        row.href.startsWith("http")
                          ? "noreferrer noopener"
                          : undefined
                      }
                      className="lp-link break-words transition-colors hover:text-lp-accent"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="lp-action group mt-7 inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
            >
              <span className="lp-link-on">{t("visit.directionsCta")}</span>
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          ) : null}
        </div>

        {embedSrc ? (
          <div className="lg:col-span-7">
            <div className="aspect-4/3 w-full overflow-clip rounded-3xl border border-lp-rule-firm bg-lp-sand lg:aspect-16/10">
              <iframe
                src={embedSrc}
                title={t("visit.mapTitle", { church: church.name })}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0 grayscale-[0.35] contrast-[1.05]"
              />
            </div>
          </div>
        ) : null}
      </div>
    </LandingSection>
  );
}
