"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/server/audit";

export type DeleteGivingResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteGivingAction(
  id: string,
): Promise<DeleteGivingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const entry = await prisma.givingEntry.findUnique({
      where: { id },
      select: { serviceId: true, fundId: true, amount: true },
    });
    if (!entry) return { ok: false, error: "NOT_FOUND" };
    await prisma.givingEntry.delete({ where: { id } });
    await writeAudit({
      userId: session.user.id,
      action: "giving.delete",
      entityType: "GivingEntry",
      entityId: id,
      metadata: {
        serviceId: entry.serviceId,
        fundId: entry.fundId,
        amount: entry.amount.toString(),
      },
    });
    revalidatePath("/admin/giving");
    revalidatePath("/admin/giving/reports");
    return { ok: true };
  } catch (e) {
    console.error("[deleteGivingEntry]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
