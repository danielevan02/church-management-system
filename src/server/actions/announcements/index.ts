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

export type AnnouncementActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidate(id?: string) {
  revalidatePath("/admin/announcements");
  revalidatePath("/me/announcements");
  revalidatePath("/me/dashboard");
  if (id) revalidatePath(`/admin/announcements/${id}`);
}

export async function createAnnouncementAction(
  input: AnnouncementInput,
): Promise<AnnouncementActionResult<{ id: string }>> {
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
    revalidate(announcement.id);

    // Fan out push only when the announcement is live now. Scheduled ones
    // (publishedAt in the future) will appear in the inbox at the right
    // time but won't fire a push without a cron — accept that gap for now.
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

export async function updateAnnouncementAction(
  id: string,
  input: AnnouncementInput,
): Promise<AnnouncementActionResult<{ id: string }>> {
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
    revalidate(id);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteAnnouncementAction(
  id: string,
): Promise<AnnouncementActionResult> {
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
    revalidate();
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("[deleteAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
