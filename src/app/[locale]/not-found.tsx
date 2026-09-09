import { getTranslations } from "next-intl/server";
import { Inter, Newsreader } from "next/font/google";

import { Link } from "@/lib/i18n/navigation";

import "@/styles/landing/index.css";

const displaySerif = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-sm-serif",
  display: "swap",
});

const operationalSans = Inter({
  subsets: ["latin"],
  variable: "--font-sm-sans",
  display: "swap",
});

/**
 * The 404, in the public palette.
 *
 * It lives under `[locale]` rather than at the app root because
 * `src/app/layout.tsx` is a pass-through with no `<html>`/`<body>` — the
 * document is defined in `[locale]/layout.tsx`, so a root `not-found.tsx` has
 * nothing to render into. The `[...rest]` catch-all is what routes unmatched
 * paths here.
 *
 * Deliberately not a dead end: a visitor who mistyped a devotional URL is
 * offered the archive, not just a link home.
 */
export default async function NotFound() {
  const t = await getTranslations("lp");

  return (
    <div
      className={`sm-root ${displaySerif.variable} ${operationalSans.variable}`}
    >
      <main className="sm-nf sm-tone-dark">
        <p className="sm-label sm-nf-code">{t("notFound.code")}</p>
        <h1 className="sm-h1" style={{ maxWidth: "26ch" }}>
          {t("notFound.title")}
        </h1>
        <p
          className="sm-lead"
          style={{ maxWidth: "44ch", color: "var(--sm-fg-muted)" }}
        >
          {t("notFound.body")}
        </p>
        <div className="sm-nf-actions">
          <Link href="/" className="sm-btn sm-btn-primary sm-action">
            {t("notFound.home")}
          </Link>
          <Link href="/renungan" className="sm-btn sm-btn-ghost sm-action">
            {t("notFound.devotionalCta")}
          </Link>
        </div>
      </main>
    </div>
  );
}
