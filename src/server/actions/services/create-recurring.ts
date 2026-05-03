"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { parseJakartaInput } from "@/lib/datetime";
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
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
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

  // `firstDate` was parsed via `new Date("yyyy-MM-dd")` which yields
  // UTC midnight. Use UTC accessors so we read the calendar date the
  // user picked regardless of server timezone, then build a Jakarta
  // wall-clock string for each occurrence and convert to UTC via
  // parseJakartaInput.
  const baseY = data.firstDate.getUTCFullYear();
  const baseM = data.firstDate.getUTCMonth();
  const baseD = data.firstDate.getUTCDate();

  const occurrences: Date[] = [];
  for (let i = 0; i < data.count; i += 1) {
    const day = new Date(Date.UTC(baseY, baseM, baseD + i * data.intervalDays));
    const ymd = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`;
    const startsAt = parseJakartaInput(`${ymd}T${data.time}`);
    if (!startsAt) {
      return { ok: false, error: "VALIDATION_FAILED" };
    }
    occurrences.push(startsAt);
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
