"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/server/audit";

export type ToggleUserActiveResult =
  | { ok: true }
  | { ok: false; error: string };

export async function toggleUserActiveAction(
  id: string,
): Promise<ToggleUserActiveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  if (id === session.user.id) {
    return { ok: false, error: "CANNOT_DEACTIVATE_SELF" };
  }

  try {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true, role: true },
    });
    if (!u) return { ok: false, error: "NOT_FOUND" };

    await prisma.user.update({
      where: { id },
      data: { isActive: !u.isActive },
    });

    await writeAudit({
      userId: session.user.id,
      action: u.isActive ? "user.deactivate" : "user.activate",
      entityType: "User",
      entityId: id,
    });

    revalidatePath("/admin/settings/users");
    revalidatePath(`/admin/settings/users/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[toggleUserActive]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
