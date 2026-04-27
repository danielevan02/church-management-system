"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  type AssignMemberInput,
  type HouseholdInput,
  assignMemberSchema,
  householdInputSchema,
} from "@/lib/validation/household";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function authorize() {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" } as const;
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
    return { ok: true } as const;
  } catch {
    return { ok: false, error: "FORBIDDEN" } as const;
  }
}

export async function createHouseholdAction(
  input: HouseholdInput,
): Promise<Result<{ id: string }>> {
  const auth = await authorize();
  if (!auth.ok) return auth;

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

export async function updateHouseholdAction(
  id: string,
  input: HouseholdInput,
): Promise<Result> {
  const auth = await authorize();
  if (!auth.ok) return auth;

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

export async function softDeleteHouseholdAction(
  id: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
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

export async function assignMemberToHouseholdAction(
  householdId: string,
  input: AssignMemberInput,
): Promise<Result> {
  const auth = await authorize();
  if (!auth.ok) return auth;

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

export async function removeMemberFromHouseholdAction(
  householdId: string,
  memberId: string,
): Promise<Result> {
  const auth = await authorize();
  if (!auth.ok) return auth;

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
