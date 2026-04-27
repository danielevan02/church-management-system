import type { NextAuthConfig } from "next-auth";

import type { Role } from "@prisma/client";

type AppJwt = {
  sub?: string;
  role?: Role;
  memberId?: string | null;
};

const PUBLIC_PREFIXES = [
  "/auth",
  "/give",
  "/attend",
  "/events",
  "/prayer-requests",
];

const ADMIN_PREFIX = "/admin";
const MEMBER_PREFIX = "/me";

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(id|en)(\/.*)?$/);
  return match ? match[2] || "/" : pathname;
}

function isPublic(path: string): boolean {
  if (path === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export const authConfig = {
  pages: {
    signIn: "/auth/sign-in",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = stripLocale(request.nextUrl.pathname);
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as Role | undefined;

      if (isPublic(path)) return true;

      if (path.startsWith(ADMIN_PREFIX)) {
        return isLoggedIn && role !== undefined && role !== "MEMBER";
      }
      if (path.startsWith(MEMBER_PREFIX)) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      const t = token as AppJwt;
      if (user) {
        t.role = user.role;
        t.memberId = user.memberId;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as AppJwt;
      if (t.sub) session.user.id = t.sub;
      if (t.role) session.user.role = t.role;
      session.user.memberId = t.memberId ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
