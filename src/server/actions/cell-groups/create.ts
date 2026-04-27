"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  cellGroupInputSchema,
  type CellGroupInput,
} from "@/lib/validation/cell-group";

export type CreateCellGroupResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createCellGroupAction(
  input: CellGroupInput,
): Promise<CreateCellGroupResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
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
  try {
    const leader = await prisma.member.findFirst({
      where: { id: data.leaderId, deletedAt: null },
      select: { id: true },
    });
    if (!leader) return { ok: false, error: "LEADER_NOT_FOUND" };

    const group = await prisma.cellGroup.create({
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
      select: { id: true },
    });

    revalidatePath("/admin/cell-groups");
    return { ok: true, data: { id: group.id } };
  } catch (e) {
    console.error("[createCellGroup]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
