"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  prayerRequestInputSchema,
  type PrayerRequestInput,
} from "@/lib/validation/prayer-requests";

export type SubmitMyPrayerRequestResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Submit a prayer request from the member portal. Bound to the current
 * member; admins/staff use the admin form which goes through the admin actions.
 */
export async function submitMyPrayerRequestAction(
  input: PrayerRequestInput,
): Promise<SubmitMyPrayerRequestResult> {
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
