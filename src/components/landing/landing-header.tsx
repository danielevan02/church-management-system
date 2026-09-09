import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LandingMobileNav } from "@/components/landing/landing-mobile-nav";
import { Link } from "@/lib/i18n/navigation";
import { LoadingLink } from "@/components/shared/loading-link";
import { LocaleSwitcherStatic } from "@/components/shared/locale-switcher-static";
import { church } from "@/config/church";
import { buildPublicNavLinks } from "@/config/public-nav";

import type { PublicSections } from "@/config/public-nav";

/**
 * The masthead.
 *
 * It deliberately does not float translucently over the hero and then
 * materialise on scroll — that trick costs a client component and a scroll
 * listener to buy an effect nobody notices past the first second.
 *
 * The church's seal is used at its own size on the paper ground rather than
 * boxed inside a rounded tile. It is a real emblem — an official one, in three
 * colours — and putting a border around it makes it look like a favicon.
 */
export async function LandingHeader({
  sections,
}: {
  sections: PublicSections;
}) {
  const t = await getTranslations("landing");
  const links = buildPublicNavLinks(t, sections);

  return (
    <header className="sticky top-0 z-50 border-b border-lp-rule bg-lp-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-320 items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-14">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/icon-ui-192.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-7 w-7 object-contain"
          />
          <span className="font-display text-[1.0625rem] font-extrabold leading-none tracking-[-0.03em] text-lp-ink">
            {church.shortName}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="lp-link lp-nav text-lp-ink-soft transition-colors hover:text-lp-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          <LocaleSwitcherStatic />

          <LoadingLink
            href="/auth/sign-in"
            className="hidden lp-small text-lp-ink-soft transition-colors hover:text-lp-ink sm:inline-flex"
          >
            {t("hero.staffSignIn")}
          </LoadingLink>

          <LoadingLink
            href="/auth/member"
            className="lp-action hidden h-9 items-center rounded-full bg-lp-ink px-5 text-lp-paper transition-colors hover:bg-lp-accent-deep sm:inline-flex"
          >
            {t("hero.primaryCta")}
          </LoadingLink>

          <LandingMobileNav
            menuLabel={t("nav.menu")}
            links={links}
            actions={[
              {
                href: "/auth/member",
                label: t("hero.primaryCta"),
                strong: true,
              },
              { href: "/auth/sign-in", label: t("hero.staffSignIn") },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
