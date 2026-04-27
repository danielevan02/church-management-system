"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type SoftDeleteResult = { ok: true } | { ok: false; error: string };

export async function softDeleteMemberAction(
  id: string,
): Promise<SoftDeleteResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.member.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[softDeleteMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function restoreMemberAction(
  id: string,
): Promise<SoftDeleteResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.member.update({
      where: { id },
      data: { deletedAt: null, status: "ACTIVE" },
    });
    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[restoreMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
