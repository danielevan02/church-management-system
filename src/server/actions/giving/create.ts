"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  givingEntryInputSchema,
  type GivingEntryInput,
} from "@/lib/validation/giving";

export type CreateGivingResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createGivingAction(
  input: GivingEntryInput,
): Promise<CreateGivingResult> {
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

    const entry = await prisma.givingEntry.create({
      data: {
        serviceId: data.serviceId,
        fundId: data.fundId,
        amount: data.amount,
        receivedAt: data.receivedAt,
        notes: data.notes,
        recordedBy: session.user.email ?? null,
      },
      select: { id: true },
    });

    revalidatePath("/admin/giving");
    revalidatePath("/admin/giving/reports");
    return { ok: true, data: { id: entry.id } };
  } catch (e) {
    console.error("[createGivingEntry]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
