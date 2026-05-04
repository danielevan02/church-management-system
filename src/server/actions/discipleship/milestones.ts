"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  milestoneInputSchema,
  type MilestoneInput,
} from "@/lib/validation/discipleship";

export type MilestoneResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createMilestoneAction(
  input: MilestoneInput,
): Promise<MilestoneResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = milestoneInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    const record = await prisma.discipleshipMilestone.create({
      data: {
        memberId: data.memberId,
        type: data.type,
        achievedAt: data.achievedAt,
        notes: data.notes,
        recordedBy: session.user.username ?? "unknown",
      },
      select: { id: true },
    });
    revalidatePath("/admin/discipleship");
    revalidatePath(`/admin/members/${data.memberId}`);
    revalidatePath("/me/discipleship");
    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[createMilestone]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateMilestoneAction(
  id: string,
  input: MilestoneInput,
): Promise<MilestoneResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = milestoneInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    await prisma.discipleshipMilestone.update({
      where: { id },
      data: {
        memberId: data.memberId,
        type: data.type,
        achievedAt: data.achievedAt,
        notes: data.notes,
      },
    });
    revalidatePath("/admin/discipleship");
    revalidatePath(`/admin/discipleship/${id}`);
    revalidatePath(`/admin/members/${data.memberId}`);
    revalidatePath("/me/discipleship");
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateMilestone]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteMilestoneAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const record = await prisma.discipleshipMilestone.findUnique({
      where: { id },
      select: { memberId: true },
    });
    if (!record) return { ok: false, error: "NOT_FOUND" };
    await prisma.discipleshipMilestone.delete({ where: { id } });
    revalidatePath("/admin/discipleship");
    revalidatePath(`/admin/members/${record.memberId}`);
    revalidatePath("/me/discipleship");
    return { ok: true };
  } catch (e) {
    console.error("[deleteMilestone]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
