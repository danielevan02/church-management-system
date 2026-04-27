"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { givingInputSchema, type GivingInput } from "@/lib/validation/giving";

export type UpdateGivingResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateGivingAction(
  id: string,
  input: GivingInput,
): Promise<UpdateGivingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = givingInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  try {
    await prisma.givingRecord.update({
      where: { id },
      data: {
        fundId: data.fundId,
        memberId: data.memberId,
        giverName: data.giverName,
        giverPhone: data.giverPhone,
        giverEmail: data.giverEmail,
        amount: data.amount,
        method: data.method,
        status: data.status,
        receivedAt: data.receivedAt,
        externalRef: data.externalRef,
        notes: data.notes,
      },
    });

    revalidatePath("/admin/giving");
    revalidatePath(`/admin/giving/${id}`);
    if (data.memberId) {
      revalidatePath(`/admin/members/${data.memberId}`);
      revalidatePath("/me/giving");
    }
    return { ok: true };
  } catch (e) {
    console.error("[updateGiving]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
