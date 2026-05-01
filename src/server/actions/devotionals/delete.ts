"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeleteDevotionalResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteDevotionalAction(
  id: string,
): Promise<DeleteDevotionalResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const existing = await prisma.devotional.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };

    await prisma.devotional.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/devotionals");
    revalidatePath("/me/devotionals");
    revalidatePath("/me/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("[deleteDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
