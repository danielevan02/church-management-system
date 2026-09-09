/**
 * Which optional sections of the public site currently exist.
 *
 * Three of the landing page's sections disappear when their data or
 * configuration is absent, and the nav must not link to a section that is not
 * on the page.
 */
export type PublicSections = {
  devotional: boolean;
  events: boolean;
  visit: boolean;
};

export type PublicNavLink = { href: string; label: string };

/**
 * The public navigation, in one place.
 *
 * The header and the footer previously each built this list themselves, from
 * two copies of the same six-entry array with the same three `show` flags —
 * which is a guarantee that one day one of them gains an entry and the other
 * does not.
 *
 * Every href is **absolute** (`/#jadwal`, not `#jadwal`). That is what lets
 * the same header and footer serve pages other than the landing page: from
 * `/renungan`, a bare `#jadwal` scrolls to nothing, while `/#jadwal` goes
 * home and lands on the section. On the landing page itself the browser still
 * treats it as a same-document jump, so nothing is lost there.
 */
export function buildPublicNavLinks(
  t: (key: string) => string,
  sections: PublicSections,
): PublicNavLink[] {
  return [
    { href: "/#jadwal", label: t("nav.schedule"), show: true },
    { href: "/#tentang", label: t("nav.about"), show: true },
    { href: "/renungan", label: t("nav.devotional"), show: sections.devotional },
    { href: "/#agenda", label: t("nav.events"), show: sections.events },
    { href: "/#persembahan", label: t("nav.give"), show: true },
    { href: "/#kunjungi", label: t("nav.visit"), show: sections.visit },
  ]
    .filter((link) => link.show)
    .map(({ href, label }) => ({ href, label }));
}
