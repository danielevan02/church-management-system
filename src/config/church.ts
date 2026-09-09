const FALLBACK_PRIMARY = "#1e3a8a";

/**
 * The one env var in this file whose *value* can be malformed rather than
 * merely missing, and it fails silently.
 *
 * A hex colour starts with `#`, and an unquoted `.env` line is parsed as a
 * comment from the `#` onwards — so `NEXT_PUBLIC_PRIMARY_COLOR=#0F766E` arrives
 * as an empty string, not as `undefined`, and `??` never fires. That is not
 * hypothetical: it is why the sign-in page's branded panel rendered
 * `linear-gradient(135deg,  0%, dd 50%, 99 100%)` — an invalid gradient, which
 * a browser drops whole, leaving white text on a white ground. It also emptied
 * the manifest's `theme_color`, the PWA `themeColor` and the settings swatch.
 *
 * `scripts/build-theme.cjs` already reads the `.env` files itself rather than
 * trusting `process.env` for exactly this reason, which is why the generated
 * palette stayed correct while everything reading this config did not.
 *
 * So validate the shape, not the presence.
 */
function readPrimaryColor(): string {
  const raw = process.env.NEXT_PUBLIC_PRIMARY_COLOR?.trim();
  if (!raw) return FALLBACK_PRIMARY;
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : FALLBACK_PRIMARY;
}

/**
 * Absolute origin for canonical URLs, OpenGraph tags and the sitemap.
 *
 * Derived from `NEXT_PUBLIC_CHURCH_DOMAIN` rather than from a separate
 * variable, so a deployment cannot end up with a landing page on one host and
 * a sitemap advertising another. The domain is accepted with or without a
 * scheme and with or without a trailing slash, because every deployment guide
 * ever written gets copy-pasted in all four shapes.
 *
 * Localhost is special-cased to `http`, since `https://localhost:3000` is not
 * a thing anybody is serving and a canonical tag pointing at it during
 * development is more confusing than useful.
 */
function readSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_CHURCH_DOMAIN ?? "").trim();
  if (!raw) return "http://localhost:3000";
  const withoutSlash = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutSlash)) return withoutSlash;
  const scheme = /^localhost(:\d+)?$/i.test(withoutSlash) ? "http" : "https";
  return `${scheme}://${withoutSlash}`;
}

export const church = {
  name: process.env.NEXT_PUBLIC_CHURCH_NAME ?? "Church Management System",
  shortName: process.env.NEXT_PUBLIC_CHURCH_SHORT_NAME ?? "ChMS",
  domain: process.env.NEXT_PUBLIC_CHURCH_DOMAIN ?? "localhost",
  /** Absolute origin, no trailing slash — e.g. `https://gkjtangerang.org`. */
  siteUrl: readSiteUrl(),
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "id") as "id" | "en",
  /** Raw hex, for the places that genuinely need one: the manifest and the
   *  PWA theme colour. UI should use the `primary` design token instead. */
  primaryColor: readPrimaryColor(),
  timezone: process.env.APP_TIMEZONE ?? "Asia/Jakarta",
  /**
   * Where the church actually is, and how to reach it.
   *
   * Every field defaults to an empty string rather than a placeholder, and the
   * landing page hides the section that needs it when it is blank. A church
   * site that shows "Jl. Contoh No. 123" is worse than one that shows nothing:
   * research on church sites is unanimous that the address is the single most
   * load-bearing fact on the page, so a wrong one actively misdirects visitors.
   */
  contact: {
    /** Street address, one line. */
    address: process.env.NEXT_PUBLIC_CHURCH_ADDRESS ?? "",
    /** City + province, shown under the address. */
    city: process.env.NEXT_PUBLIC_CHURCH_CITY ?? "",
    /** A share link from Google Maps — used for the "get directions" button. */
    mapsUrl: process.env.NEXT_PUBLIC_CHURCH_MAPS_URL ?? "",
    /** `place` query for the embedded map iframe, e.g. "GKJ Tangerang". */
    mapsQuery: process.env.NEXT_PUBLIC_CHURCH_MAPS_QUERY ?? "",
    phone: process.env.NEXT_PUBLIC_CHURCH_PHONE ?? "",
    /** E.164 without the plus, e.g. 6281234567890. */
    whatsapp: process.env.NEXT_PUBLIC_CHURCH_WHATSAPP ?? "",
    email: process.env.NEXT_PUBLIC_CHURCH_EMAIL ?? "",
    instagram: process.env.NEXT_PUBLIC_CHURCH_INSTAGRAM ?? "",
    youtube: process.env.NEXT_PUBLIC_CHURCH_YOUTUBE ?? "",
  },
  bank: {
    name: process.env.NEXT_PUBLIC_CHURCH_BANK_NAME ?? "BCA",
    accountNumber: process.env.NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_HOLDER ?? "",
    /** Path under /public to the QRIS image. */
    qrisImagePath:
      process.env.NEXT_PUBLIC_CHURCH_QRIS_IMAGE_PATH ?? "/qris.png",
    /** Optional WhatsApp number members can ping after transferring. */
    confirmationWhatsApp:
      process.env.NEXT_PUBLIC_CHURCH_GIVING_CONFIRM_WA ?? "",
  },
} as const;

export type ChurchConfig = typeof church;
