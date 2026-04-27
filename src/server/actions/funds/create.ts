"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { fundInputSchema, type FundInput } from "@/lib/validation/fund";

export type CreateFundResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createFundAction(
  input: FundInput,
): Promise<CreateFundResult> {
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
    const fund = await prisma.fund.create({
      data: {
        name: data.name.trim(),
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath("/admin/giving");
    revalidatePath("/admin/giving/funds");
    return { ok: true, data: { id: fund.id } };
  } catch (e) {
    console.error("[createFund]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
