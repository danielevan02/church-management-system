"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeleteFundResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteFundAction(id: string): Promise<DeleteFundResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const count = await prisma.givingRecord.count({ where: { fundId: id } });
    if (count > 0) {
      return { ok: false, error: "HAS_GIVING" };
    }
    await prisma.fund.delete({ where: { id } });
    revalidatePath("/admin/giving");
    revalidatePath("/admin/giving/funds");
    return { ok: true };
  } catch (e) {
    console.error("[deleteFund]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
