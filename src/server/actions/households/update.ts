"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  householdInputSchema,
  type HouseholdInput,
} from "@/lib/validation/household";

export type UpdateHouseholdResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateHouseholdAction(
  id: string,
  input: HouseholdInput,
): Promise<UpdateHouseholdResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = householdInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.household.update({
      where: { id, deletedAt: null },
      data: parsed.data,
    });
    revalidatePath("/admin/households");
    revalidatePath(`/admin/households/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateHousehold]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
