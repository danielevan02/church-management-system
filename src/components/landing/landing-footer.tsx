import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LoadingLink } from "@/components/shared/loading-link";
import { Link } from "@/lib/i18n/navigation";
import { church } from "@/config/church";
import { buildPublicNavLinks } from "@/config/public-nav";

import type { PublicSections } from "@/config/public-nav";

/**
 * The closing band: a final invitation and the footer, on one dark ground.
 *
 * This is the page's only dark region, and it is placed here rather than
 * behind the giving section (where the first draft put it) because the dark
 * moment should be the one that asks something of the reader, not the one that
 * takes a bank transfer. Running the CTA and the footer together means the
 * page ends on a single deliberate block instead of on a banner followed by a
 * second, differently-coloured banner.
 */
export async function LandingFooter({
  sections,
}: {
  sections: PublicSections;
}) {
  const t = await getTranslations("landing");
  const { mapsUrl, whatsapp, email, instagram, youtube } = church.contact;
  const navLinks = buildPublicNavLinks(t, sections);

  const reachLinks = [
    whatsapp
      ? { href: `https://wa.me/${whatsapp}`, label: t("visit.whatsappLabel") }
      : null,
    email ? { href: `mailto:${email}`, label: t("visit.emailLabel") } : null,
    instagram ? { href: instagram, label: t("visit.instagramLabel") } : null,
    youtube ? { href: youtube, label: t("visit.youtubeLabel") } : null,
    mapsUrl ? { href: mapsUrl, label: t("visit.directionsCta") } : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <footer className="bg-lp-night text-lp-on-night">
      <div className="mx-auto w-full max-w-320 px-6 sm:px-10 lg:px-14">
        {/* Closing invitation */}
        <div className="grid gap-x-10 gap-y-10 py-20 sm:py-28 lg:grid-cols-12 lg:py-36">
          <div className="lg:col-span-7">
            <h2 className="lp-h2 text-balance">
              {t("closing.title")}
            </h2>
            <p className="lp-lead mt-6 max-w-md text-pretty text-lp-on-night-soft">
              {t("closing.body")}
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9 lg:items-end">
            <LoadingLink
              href="/auth/member"
              className="lp-action h-12 rounded-full bg-lp-on-night px-7 text-lp-night transition-colors hover:bg-lp-paper"
            >
              {t("footer.memberCta")}
            </LoadingLink>

            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="lp-action group inline-flex items-center gap-1.5 text-lp-on-night transition-colors hover:text-lp-on-night-soft"
              >
                <span className="lp-link-on">{t("hero.directionsCta")}</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            ) : null}
          </div>
        </div>

        {/* Directory */}
        <div className="grid gap-x-10 gap-y-10 border-t border-lp-night-rule py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icon-ui-192.png"
                alt=""
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
              <span className="font-display text-[1.0625rem] font-extrabold leading-none tracking-[-0.03em]">
                {church.shortName}
              </span>
            </div>
            <p className="lp-small mt-4 max-w-xs text-lp-on-night-soft">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterColumn title={t("footer.navTitle")}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="lp-link w-fit">
                {link.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.portalTitle")}>
            <LoadingLink href="/auth/member" className="lp-link w-fit">
              {t("footer.memberCta")}
            </LoadingLink>
            <LoadingLink href="/auth/sign-in" className="lp-link w-fit">
              {t("footer.staffCta")}
            </LoadingLink>
            <LoadingLink href="/give" className="lp-link w-fit">
              {t("give.pageCta")}
            </LoadingLink>
          </FooterColumn>

          {reachLinks.length > 0 ? (
            <FooterColumn title={t("footer.reachTitle")}>
              {reachLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noreferrer noopener"
                      : undefined
                  }
                  className="lp-link w-fit"
                >
                  {link.label}
                </a>
              ))}
            </FooterColumn>
          ) : null}
        </div>

        <div className="lp-small flex flex-col gap-2 border-t border-lp-night-rule py-8 text-lp-on-night-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {church.name}
          </p>
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:col-span-2">
      <h3 className="lp-label text-lp-on-night-soft">{title}</h3>
      <nav className="lp-nav mt-5 flex flex-col items-start gap-3 text-lp-on-night">
        {children}
      </nav>
    </div>
  );
}
