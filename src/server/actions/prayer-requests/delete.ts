"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeletePrayerRequestResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Hard-delete only by ADMIN+ — for spam/test entries.
 */
export async function deletePrayerRequestAction(
  id: string,
): Promise<DeletePrayerRequestResult> {
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
