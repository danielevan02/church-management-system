"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { canAccessCellGroup, requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  cellGroupInputSchema,
  type CellGroupInput,
} from "@/lib/validation/cell-group";

export type UpdateCellGroupResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateCellGroupAction(
  id: string,
  input: CellGroupInput,
): Promise<UpdateCellGroupResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const role = session.user.role;
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF";
  if (!isStaff) {
    const allowed = await canAccessCellGroup(
      {
        id: session.user.id ?? "",
        role: session.user.role,
        memberId: session.user.memberId ?? null,
      },
      id,
    );
    if (!allowed) return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = cellGroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Leaders cannot reassign leadership
  if (!isStaff) {
    const current = await prisma.cellGroup.findUnique({
      where: { id },
      select: { leaderId: true },
    });
    if (current && current.leaderId !== data.leaderId) {
      return { ok: false, error: "FORBIDDEN_LEADER_CHANGE" };
    }
  } else {
    const leader = await prisma.member.findFirst({
      where: { id: data.leaderId, deletedAt: null },
      select: { id: true },
    });
    if (!leader) return { ok: false, error: "LEADER_NOT_FOUND" };
  }

  try {
    await prisma.cellGroup.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description,
        leaderId: data.leaderId,
        parentGroupId: data.parentGroupId,
        meetingDay: data.meetingDay,
        meetingTime: data.meetingTime,
        meetingLocation: data.meetingLocation,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/cell-groups");
    revalidatePath(`/admin/cell-groups/${id}`);
    revalidatePath("/me/cell-group");
    return { ok: true };
  } catch (e) {
    console.error("[updateCellGroup]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export type DeleteCellGroupResult =
  | { ok: true }
  | { ok: false; error: string };

export async function softDeleteCellGroupAction(
  id: string,
): Promise<DeleteCellGroupResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.cellGroup.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    revalidatePath("/admin/cell-groups");
    return { ok: true };
  } catch (e) {
    console.error("[softDeleteCellGroup]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
