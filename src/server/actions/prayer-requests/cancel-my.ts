"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CancelMyPrayerRequestResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Member cancels (archives) their own request.
 */
export async function cancelMyPrayerRequestAction(
  id: string,
): Promise<CancelMyPrayerRequestResult> {
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
