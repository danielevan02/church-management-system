"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { givingInputSchema, type GivingInput } from "@/lib/validation/giving";

export type CreateGivingResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createGivingAction(
  input: GivingInput,
): Promise<CreateGivingResult> {
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
    const fund = await prisma.fund.findUnique({
      where: { id: data.fundId },
      select: { id: true, isActive: true },
    });
    if (!fund) return { ok: false, error: "FUND_NOT_FOUND" };
    if (!fund.isActive) return { ok: false, error: "FUND_INACTIVE" };

    const record = await prisma.givingRecord.create({
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
        recordedBy: session.user.email ?? null,
      },
      select: { id: true },
    });

    revalidatePath("/admin/giving");
    if (data.memberId) {
      revalidatePath(`/admin/members/${data.memberId}`);
      revalidatePath("/me/giving");
    }
    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[createGiving]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
