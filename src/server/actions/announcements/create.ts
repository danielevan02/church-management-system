"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { excerpt } from "@/lib/markdown";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendPushToAllMembers } from "@/lib/push";
import {
  announcementInputSchema,
  type AnnouncementInput,
} from "@/lib/validation/announcement";

export type CreateAnnouncementResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createAnnouncementAction(
  input: AnnouncementInput,
): Promise<CreateAnnouncementResult> {
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
    const publishedAt = data.publishedAt ?? new Date();
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        publishedAt,
        createdById: session.user.id ?? null,
      },
      select: { id: true },
    });
    revalidatePath("/admin/announcements");
    revalidatePath("/me/announcements");
    revalidatePath("/me/dashboard");
    revalidatePath(`/admin/announcements/${announcement.id}`);

    if (publishedAt.getTime() <= Date.now()) {
      void sendPushToAllMembers({
        title: data.title,
        body: excerpt(data.body),
        url: `/me/announcements/${announcement.id}`,
        tag: `announcement:${announcement.id}`,
      }).catch((e) => console.error("[announcement push fanout]", e));
    }

    return { ok: true, data: { id: announcement.id } };
  } catch (e) {
    console.error("[createAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
