"use server";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type MemberSearchResult =
  | {
      ok: true;
      data: Array<{
        id: string;
        fullName: string;
        phone: string | null;
        photoUrl: string | null;
      }>;
    }
  | { ok: false; error: string };

export async function searchMembersAction(
  query: string,
): Promise<MemberSearchResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF", "LEADER"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const q = query.trim();
  if (q.length < 2) return { ok: true, data: [] };

  try {
    const items = await prisma.member.findMany({
      where: {
        deletedAt: null,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { nickname: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { fullName: "asc" },
      take: 10,
      select: { id: true, fullName: true, phone: true, photoUrl: true },
    });
    return { ok: true, data: items };
  } catch (e) {
    console.error("[searchMembers]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
