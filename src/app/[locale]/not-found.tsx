import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";

/**
 * The 404 users actually see.
 *
 * Every `notFound()` inside a locale route lands here — a devotional slug that
 * does not exist, a mistyped `/me/...`, a stale bookmark — as does any
 * unmatched path, via `[locale]/[...rest]`.
 *
 * **Known limitation: the HTTP status.** An unmatched path (`/halaman-ngawur`)
 * correctly returns 404. A *matched* route that calls `notFound()` —
 * `/renungan/slug-yang-tidak-ada` — renders this page but answers 200. The
 * cause is the `x-middleware-rewrite` that next-intl's middleware applies to
 * every request: Next does not propagate a `notFound()` status back through a
 * middleware rewrite. It is not the streaming boundary, which was the first
 * suspect and was ruled out by removing the route's `loading.tsx` and watching
 * the status stay at 200.
 *
 * The practical exposure is small — nothing links to a slug that does not
 * exist, and the sitemap lists only real ones, so this is reachable mainly by
 * hand-typing or by following a URL from before a devotional was withdrawn.
 * Google treats such a page as a soft 404 and declines to index it, which is
 * the outcome we want anyway; it just arrives via a heuristic instead of via
 * the status line. Worth revisiting if next-intl or Next fixes the rewrite
 * behaviour.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-lp-paper px-6 text-center">
      <p className="lp-label text-lp-ink-faint">404</p>

      <h1 className="lp-h2 mt-5 max-w-2xl text-balance text-lp-ink">
        {t("title")}
      </h1>

      <p className="lp-lead mt-6 max-w-md text-pretty text-lp-ink-soft">
        {t("body")}
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Link
          href="/"
          className="lp-action inline-flex h-11 items-center rounded-full bg-lp-ink px-6 text-lp-paper transition-colors hover:bg-lp-accent-deep"
        >
          {t("homeCta")}
        </Link>
        <Link
          href="/renungan"
          className="lp-action text-lp-ink transition-colors hover:text-lp-accent"
        >
          <span className="lp-link-on">{t("devotionalCta")}</span>
        </Link>
      </div>
    </main>
  );
}
