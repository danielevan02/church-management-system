"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeleteAnnouncementResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteAnnouncementAction(
  id: string,
): Promise<DeleteAnnouncementResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const existing = await prisma.announcement.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };

    await prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/announcements");
    revalidatePath("/me/announcements");
    revalidatePath("/me/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("[deleteAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
