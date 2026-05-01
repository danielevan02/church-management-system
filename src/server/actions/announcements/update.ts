"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  announcementInputSchema,
  type AnnouncementInput,
} from "@/lib/validation/announcement";

export type UpdateAnnouncementResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateAnnouncementAction(
  id: string,
  input: AnnouncementInput,
): Promise<UpdateAnnouncementResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = announcementInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.announcement.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };

    await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        publishedAt: data.publishedAt ?? undefined,
      },
    });
    revalidatePath("/admin/announcements");
    revalidatePath("/me/announcements");
    revalidatePath("/me/dashboard");
    revalidatePath(`/admin/announcements/${id}`);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
