"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  prayerRequestAdminInputSchema,
  type PrayerRequestAdminInput,
} from "@/lib/validation/prayer-requests";

export type UpdatePrayerRequestResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Admin/staff full edit of a prayer request (status + body + flags).
 */
export async function updatePrayerRequestAction(
  id: string,
  input: PrayerRequestAdminInput,
): Promise<UpdatePrayerRequestResult> {
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
