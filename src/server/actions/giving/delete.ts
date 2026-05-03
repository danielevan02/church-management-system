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
    const record = await prisma.givingRecord.findUnique({
      where: { id },
      select: { memberId: true, amount: true, fundId: true },
    });
    if (!record) return { ok: false, error: "NOT_FOUND" };
    await prisma.givingRecord.delete({ where: { id } });
    await writeAudit({
      userId: session.user.id,
      action: "giving.delete",
      entityType: "GivingRecord",
      entityId: id,
      metadata: {
        memberId: record.memberId,
        fundId: record.fundId,
        amount: record.amount.toString(),
      },
    });
    revalidatePath("/admin/giving");
    if (record.memberId) {
      revalidatePath(`/admin/members/${record.memberId}`);
    }
    return { ok: true };
  } catch (e) {
    console.error("[deleteGiving]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
