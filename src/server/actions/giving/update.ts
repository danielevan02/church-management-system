"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  givingEntryInputSchema,
  type GivingEntryInput,
} from "@/lib/validation/giving";

export type UpdateGivingResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateGivingAction(
  id: string,
  input: GivingEntryInput,
): Promise<UpdateGivingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = givingEntryInputSchema.safeParse(input);
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

    if (data.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        select: { id: true },
      });
      if (!service) return { ok: false, error: "SERVICE_NOT_FOUND" };
    }

    await prisma.givingEntry.update({
      where: { id },
      data: {
        serviceId: data.serviceId,
        fundId: data.fundId,
        amount: data.amount,
        receivedAt: data.receivedAt,
        notes: data.notes,
      },
    });

    revalidatePath("/admin/giving");
    revalidatePath(`/admin/giving/${id}`);
    revalidatePath("/admin/giving/reports");
    return { ok: true };
  } catch (e) {
    console.error("[updateGivingEntry]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
