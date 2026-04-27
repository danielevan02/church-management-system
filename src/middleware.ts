import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { authConfig } from "@/lib/auth.config";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => intlMiddleware(req as unknown as NextRequest));

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
