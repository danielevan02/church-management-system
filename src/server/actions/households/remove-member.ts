"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type RemoveMemberFromHouseholdResult =
  | { ok: true }
  | { ok: false; error: string };

export async function removeMemberFromHouseholdAction(
  householdId: string,
  memberId: string,
): Promise<RemoveMemberFromHouseholdResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { householdId: null, householdRole: null },
    });
    revalidatePath("/admin/households");
    revalidatePath(`/admin/households/${householdId}`);
    revalidatePath(`/admin/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    console.error("[removeMemberFromHousehold]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
