import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/permissions";

import type { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  return session;
}

export async function requireAdminSession(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role === "MEMBER") redirect("/me/dashboard");
  return session;
}

export async function requireMemberSession(): Promise<Session> {
  return requireSession();
}

export function sessionUser(session: Session): SessionUser {
  return {
    id: session.user.id,
    role: session.user.role,
    memberId: session.user.memberId,
  };
}
