"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  assignMemberSchema,
  type AssignMemberInput,
} from "@/lib/validation/household";

export type AssignMemberToHouseholdResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function assignMemberToHouseholdAction(
  householdId: string,
  input: AssignMemberInput,
): Promise<AssignMemberToHouseholdResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = assignMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.member.update({
      where: { id: parsed.data.memberId },
      data: {
        householdId,
        householdRole: parsed.data.householdRole ?? null,
      },
    });
    revalidatePath("/admin/households");
    revalidatePath(`/admin/households/${householdId}`);
    revalidatePath(`/admin/members/${parsed.data.memberId}`);
    return { ok: true };
  } catch (e) {
    console.error("[assignMemberToHousehold]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
