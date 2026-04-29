"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema, type ServiceInput } from "@/lib/validation/service";

export type CreateServiceResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createServiceAction(
  input: ServiceInput,
): Promise<CreateServiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
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
    const service = await prisma.service.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        startsAt: data.startsAt,
        durationMin: data.durationMin,
        location: data.location,
        notes: data.notes,
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/attendance/services");
    return { ok: true, data: { id: service.id } };
  } catch (e) {
    console.error("[createService]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
