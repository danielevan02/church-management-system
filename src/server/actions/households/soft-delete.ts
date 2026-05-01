"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type SoftDeleteHouseholdResult =
  | { ok: true }
  | { ok: false; error: string };

export async function softDeleteHouseholdAction(
  id: string,
): Promise<SoftDeleteHouseholdResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.member.updateMany({
        where: { householdId: id },
        data: { householdId: null, householdRole: null },
      });
      await tx.household.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
    revalidatePath("/admin/households");
    return { ok: true };
  } catch (e) {
    console.error("[softDeleteHousehold]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
