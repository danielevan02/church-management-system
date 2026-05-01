"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  prayerRequestInputSchema,
  type PrayerRequestInput,
} from "@/lib/validation/prayer-requests";

export type UpdateMyPrayerRequestResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Member updates their own request body/flags while it's still OPEN.
 * Cannot edit once status is PRAYING/ANSWERED/ARCHIVED.
 */
export async function updateMyPrayerRequestAction(
  id: string,
  input: PrayerRequestInput,
): Promise<UpdateMyPrayerRequestResult> {
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
