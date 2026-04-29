"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole, requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  prayerRequestAdminInputSchema,
  prayerRequestInputSchema,
  prayerStatusInputSchema,
  type PrayerRequestAdminInput,
  type PrayerRequestInput,
  type PrayerStatusUpdate,
} from "@/lib/validation/prayer-requests";

export type PrayerActionResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Submit a prayer request from the member portal. Bound to the current
 * member; admins/staff use the admin form which goes through the admin actions.
 */
export async function submitMyPrayerRequestAction(
  input: PrayerRequestInput,
): Promise<PrayerActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  const memberId = session.user.memberId;
  if (!memberId) return { ok: false, error: "FORBIDDEN" };

  const parsed = prayerRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const record = await prisma.prayerRequest.create({
      data: {
        memberId,
        submittedBy: session.user.email ?? "member",
        title: data.title,
        body: data.body,
        isAnonymous: data.isAnonymous,
        isPublic: data.isPublic,
        status: "OPEN",
      },
      select: { id: true },
    });
    revalidatePath("/me/prayer-requests");
    revalidatePath("/admin/prayer-requests");
    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[submitMyPrayerRequest]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

/**
 * Member updates their own request body/flags while it's still OPEN.
 * Cannot edit once status is PRAYING/ANSWERED/ARCHIVED.
 */
export async function updateMyPrayerRequestAction(
  id: string,
  input: PrayerRequestInput,
): Promise<PrayerActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  const memberId = session.user.memberId;
  if (!memberId) return { ok: false, error: "FORBIDDEN" };

  const parsed = prayerRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.prayerRequest.findUnique({
      where: { id },
      select: { memberId: true, status: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };
    if (existing.memberId !== memberId) return { ok: false, error: "FORBIDDEN" };
    if (existing.status !== "OPEN") {
      return { ok: false, error: "LOCKED" };
    }

    await prisma.prayerRequest.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        isAnonymous: data.isAnonymous,
        isPublic: data.isPublic,
      },
    });
    revalidatePath("/me/prayer-requests");
    revalidatePath("/admin/prayer-requests");
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateMyPrayerRequest]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

/**
 * Member cancels (archives) their own request.
 */
export async function cancelMyPrayerRequestAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  const memberId = session.user.memberId;
  if (!memberId) return { ok: false, error: "FORBIDDEN" };

  try {
    const existing = await prisma.prayerRequest.findUnique({
      where: { id },
      select: { memberId: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };
    if (existing.memberId !== memberId) return { ok: false, error: "FORBIDDEN" };
    await prisma.prayerRequest.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/me/prayer-requests");
    revalidatePath("/admin/prayer-requests");
    return { ok: true };
  } catch (e) {
    console.error("[cancelMyPrayerRequest]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

/**
 * Admin/staff updates a prayer request's status.
 */
export async function updatePrayerStatusAction(
  id: string,
  input: PrayerStatusUpdate,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = prayerStatusInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  try {
    await prisma.prayerRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    revalidatePath("/admin/prayer-requests");
    revalidatePath(`/admin/prayer-requests/${id}`);
    revalidatePath("/me/prayer-requests");
    return { ok: true };
  } catch (e) {
    console.error("[updatePrayerStatus]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

/**
 * Admin/staff full edit of a prayer request (status + body + flags).
 */
export async function updatePrayerRequestAction(
  id: string,
  input: PrayerRequestAdminInput,
): Promise<PrayerActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = prayerRequestAdminInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    await prisma.prayerRequest.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        isAnonymous: data.isAnonymous,
        isPublic: data.isPublic,
        status: data.status,
      },
    });
    revalidatePath("/admin/prayer-requests");
    revalidatePath(`/admin/prayer-requests/${id}`);
    revalidatePath("/me/prayer-requests");
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updatePrayerRequest]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

/**
 * Hard-delete only by ADMIN+ — for spam/test entries.
 */
export async function deletePrayerRequestAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.prayerRequest.delete({ where: { id } });
    revalidatePath("/admin/prayer-requests");
    revalidatePath("/me/prayer-requests");
    return { ok: true };
  } catch (e) {
    console.error("[deletePrayerRequest]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
