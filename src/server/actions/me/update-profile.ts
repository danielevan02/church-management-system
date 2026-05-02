"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type OwnProfileInput,
  ownProfileSchema,
} from "@/lib/validation/own-profile";

export type UpdateOwnProfileResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateOwnProfileAction(
  input: OwnProfileInput,
): Promise<UpdateOwnProfileResult> {
  const session = await auth();
  if (!session?.user?.memberId) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  const parsed = ownProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await prisma.member.update({
      where: { id: session.user.memberId, deletedAt: null },
      data: {
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        maritalStatus: data.maritalStatus,
      },
    });

    if (data.phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone: data.phone },
      });
    }

    revalidatePath("/me/profile");
    revalidatePath("/me/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("[updateOwnProfile]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
