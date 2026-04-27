"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema, type ServiceInput } from "@/lib/validation/service";

export type UpdateServiceResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateServiceAction(
  id: string,
  input: ServiceInput,
): Promise<UpdateServiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  try {
    await prisma.service.update({
      where: { id },
      data: {
        name: data.name.trim(),
        type: data.type,
        startsAt: data.startsAt,
        durationMin: data.durationMin,
        location: data.location,
        notes: data.notes,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/attendance/services");
    revalidatePath(`/admin/attendance/services/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateService]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function setServiceActiveAction(
  id: string,
  isActive: boolean,
): Promise<UpdateServiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.service.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/attendance/services");
    revalidatePath(`/admin/attendance/services/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[setServiceActive]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
