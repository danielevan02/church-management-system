"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  childClassInputSchema,
  type ChildClassInput,
} from "@/lib/validation/children";
import { writeAudit } from "@/server/audit";

export type ClassResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return { ok: false as const, error: "FORBIDDEN" };
  }
  return { ok: true as const, userId: session.user.id, role: session.user.role };
}

export async function createChildClassAction(
  input: ChildClassInput,
): Promise<ClassResult> {
  const guard = await requireStaff();
  if (!guard.ok) return guard;

  const parsed = childClassInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  if (data.ageMin > data.ageMax) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { ageMax: ["Tidak boleh kurang dari usia minimum"] },
    };
  }

  try {
    const created = await prisma.childClass.create({
      data: {
        name: data.name,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath("/admin/children/classes");
    revalidatePath("/admin/children");
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    console.error("[createChildClass]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateChildClassAction(
  id: string,
  input: ChildClassInput,
): Promise<ClassResult> {
  const guard = await requireStaff();
  if (!guard.ok) return guard;

  const parsed = childClassInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  if (data.ageMin > data.ageMax) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { ageMax: ["Tidak boleh kurang dari usia minimum"] },
    };
  }

  try {
    await prisma.childClass.update({
      where: { id },
      data: {
        name: data.name,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/children/classes");
    revalidatePath(`/admin/children/classes/${id}`);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateChildClass]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function toggleChildClassActiveAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const guard = await requireStaff();
  if (!guard.ok) return guard;

  try {
    const cls = await prisma.childClass.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!cls) return { ok: false, error: "NOT_FOUND" };
    await prisma.childClass.update({
      where: { id },
      data: { isActive: !cls.isActive },
    });
    await writeAudit({
      userId: guard.userId,
      action: cls.isActive ? "child_class.deactivate" : "child_class.activate",
      entityType: "ChildClass",
      entityId: id,
    });
    revalidatePath("/admin/children/classes");
    return { ok: true };
  } catch (e) {
    console.error("[toggleChildClassActive]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
