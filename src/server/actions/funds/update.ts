"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { fundInputSchema, type FundInput } from "@/lib/validation/fund";

export type UpdateFundResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateFundAction(
  id: string,
  input: FundInput,
): Promise<UpdateFundResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = fundInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  try {
    await prisma.fund.update({
      where: { id },
      data: {
        name: data.name.trim(),
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/giving");
    revalidatePath("/admin/giving/funds");
    revalidatePath(`/admin/giving/funds/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateFund]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
