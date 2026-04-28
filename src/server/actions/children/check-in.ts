"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  checkInInputSchema,
  checkOutInputSchema,
  type CheckInInput,
  type CheckOutInput,
} from "@/lib/validation/children";
import { writeAudit } from "@/server/audit";

export type CheckInResult =
  | { ok: true; data: { id: string; securityCode: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip I/O/0/1 to avoid confusion

function generateCode(len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return s;
}

async function uniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode(4);
    const existing = await prisma.childCheckIn.findFirst({
      where: { securityCode: code, checkedOutAt: null },
      select: { id: true },
    });
    if (!existing) return code;
  }
  // fallback to longer code
  return generateCode(6);
}

export async function checkInChildAction(
  input: CheckInInput,
): Promise<CheckInResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = checkInInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    // Block double check-in
    const active = await prisma.childCheckIn.findFirst({
      where: { childId: data.childId, checkedOutAt: null },
      select: { id: true },
    });
    if (active) return { ok: false, error: "ALREADY_CHECKED_IN" };

    const code = await uniqueCode();
    const record = await prisma.childCheckIn.create({
      data: {
        childId: data.childId,
        guardianId: data.guardianId,
        classId: data.classId,
        securityCode: code,
        notes: data.notes,
      },
      select: { id: true, securityCode: true },
    });

    await writeAudit({
      userId: session.user.id,
      action: "child.check_in",
      entityType: "ChildCheckIn",
      entityId: record.id,
      metadata: {
        childId: data.childId,
        guardianId: data.guardianId,
        classId: data.classId,
      },
    });

    revalidatePath("/admin/children");
    revalidatePath("/admin/children/check-in");
    revalidatePath("/me/children");
    return { ok: true, data: record };
  } catch (e) {
    console.error("[checkInChild]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export type CheckOutResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function checkOutChildAction(
  input: CheckOutInput,
): Promise<CheckOutResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = checkOutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const active = await prisma.childCheckIn.findFirst({
      where: { securityCode: data.securityCode, checkedOutAt: null },
      select: { id: true, childId: true },
    });
    if (!active) return { ok: false, error: "CODE_NOT_FOUND" };

    await prisma.childCheckIn.update({
      where: { id: active.id },
      data: {
        checkedOutAt: new Date(),
        pickupGuardianId: data.pickupGuardianId,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "child.check_out",
      entityType: "ChildCheckIn",
      entityId: active.id,
      metadata: {
        childId: active.childId,
        pickupGuardianId: data.pickupGuardianId,
      },
    });

    revalidatePath("/admin/children");
    revalidatePath("/admin/children/check-in");
    revalidatePath("/me/children");
    return { ok: true, data: { id: active.id } };
  } catch (e) {
    console.error("[checkOutChild]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteCheckInAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.childCheckIn.delete({ where: { id } });
    await writeAudit({
      userId: session.user.id,
      action: "child.check_in_delete",
      entityType: "ChildCheckIn",
      entityId: id,
    });
    revalidatePath("/admin/children");
    revalidatePath("/admin/children/check-in");
    return { ok: true };
  } catch (e) {
    console.error("[deleteCheckIn]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
