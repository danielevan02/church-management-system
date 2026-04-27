"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  recurringServiceSchema,
  type RecurringServiceInput,
} from "@/lib/validation/service";

export type CreateRecurringResult =
  | { ok: true; data: { count: number; firstId: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createRecurringServicesAction(
  input: RecurringServiceInput,
): Promise<CreateRecurringResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = recurringServiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const [hh, mm] = data.time.split(":").map((n) => Number.parseInt(n, 10));

  const occurrences: Date[] = [];
  for (let i = 0; i < data.count; i += 1) {
    const d = new Date(data.firstDate);
    d.setDate(d.getDate() + i * data.intervalDays);
    d.setHours(hh, mm, 0, 0);
    occurrences.push(d);
  }

  try {
    const created = await prisma.$transaction(
      occurrences.map((startsAt) =>
        prisma.service.create({
          data: {
            name: data.name.trim(),
            type: data.type,
            startsAt,
            durationMin: data.durationMin,
            location: data.location,
            notes: data.notes,
            isActive: true,
          },
          select: { id: true },
        }),
      ),
    );
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/attendance/services");
    return {
      ok: true,
      data: { count: created.length, firstId: created[0]?.id ?? "" },
    };
  } catch (e) {
    console.error("[createRecurringServices]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
