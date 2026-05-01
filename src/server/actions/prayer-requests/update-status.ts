"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  prayerStatusInputSchema,
  type PrayerStatusUpdate,
} from "@/lib/validation/prayer-requests";

export type UpdatePrayerStatusResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Admin/staff updates a prayer request's status.
 */
export async function updatePrayerStatusAction(
  id: string,
  input: PrayerStatusUpdate,
): Promise<UpdatePrayerStatusResult> {
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
