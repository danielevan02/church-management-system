import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { authConfig } from "@/lib/auth.config";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => intlMiddleware(req as unknown as NextRequest));

export const config = {
  // Exclude `monitoring` so the Sentry tunnel route (configured via
  // `tunnelRoute` in next.config.ts) isn't rewritten to a locale-prefixed
  // path, which would 404 on the client and break error reporting.
  matcher: ["/((?!api|monitoring|_next|_vercel|.*\\..*).*)"],
};
