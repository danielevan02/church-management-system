import { church } from "@/config/church";

import type { MetadataRoute } from "next";

/**
 * robots.txt.
 *
 * The disallow list is the point. Everything under `/admin`, `/me` and
 * `/api` is already behind an auth check, but a crawler that follows a link
 * into them still burns crawl budget on redirect chains to the sign-in page,
 * and sign-in pages themselves have a habit of turning up in results for the
 * church's own name. Keeping them out of the index costs nothing and is not a
 * substitute for the auth checks, which stay where they are.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/en/admin", "/me", "/en/me", "/api/", "/auth", "/en/auth"],
    },
    sitemap: `${church.siteUrl}/sitemap.xml`,
    host: church.siteUrl,
  };
}
