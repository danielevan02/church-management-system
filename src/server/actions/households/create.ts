"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  householdInputSchema,
  type HouseholdInput,
} from "@/lib/validation/household";

export type CreateHouseholdResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createHouseholdAction(
  input: HouseholdInput,
): Promise<CreateHouseholdResult> {
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
    const household = await prisma.household.create({
      data: parsed.data,
      select: { id: true },
    });
    revalidatePath("/admin/households");
    return { ok: true, data: { id: household.id } };
  } catch (e) {
    console.error("[createHousehold]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
