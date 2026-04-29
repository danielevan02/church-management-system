"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  positionInputSchema,
  type PositionInput,
  teamInputSchema,
  type TeamInput,
} from "@/lib/validation/volunteer";

export type TeamActionResult =
  | { ok: true; data?: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createTeamAction(
  input: TeamInput,
): Promise<TeamActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = teamInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    const team = await prisma.volunteerTeam.create({
      data: {
        name: data.name.trim(),
        description: data.description,
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath("/admin/volunteers");
    revalidatePath("/admin/volunteers/teams");
    return { ok: true, data: { id: team.id } };
  } catch (e) {
    console.error("[createTeam]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateTeamAction(
  id: string,
  input: TeamInput,
): Promise<TeamActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = teamInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    await prisma.volunteerTeam.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/volunteers/teams/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateTeam]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteTeamAction(
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
    const count = await prisma.volunteerAssignment.count({
      where: { teamId: id },
    });
    if (count > 0) return { ok: false, error: "HAS_ASSIGNMENTS" };
    await prisma.volunteerPosition.deleteMany({ where: { teamId: id } });
    await prisma.volunteerTeam.delete({ where: { id } });
    revalidatePath("/admin/volunteers");
    revalidatePath("/admin/volunteers/teams");
    return { ok: true };
  } catch (e) {
    console.error("[deleteTeam]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function createPositionAction(
  teamId: string,
  input: PositionInput,
): Promise<TeamActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = positionInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    const pos = await prisma.volunteerPosition.create({
      data: {
        teamId,
        name: data.name.trim(),
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath(`/admin/volunteers/teams/${teamId}`);
    return { ok: true, data: { id: pos.id } };
  } catch (e) {
    console.error("[createPosition]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deletePositionAction(
  positionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const pos = await prisma.volunteerPosition.findUnique({
      where: { id: positionId },
      select: { teamId: true, _count: { select: { assignments: true } } },
    });
    if (!pos) return { ok: false, error: "NOT_FOUND" };
    if (pos._count.assignments > 0) {
      // Soft-deactivate to preserve historical assignments
      await prisma.volunteerPosition.update({
        where: { id: positionId },
        data: { isActive: false },
      });
    } else {
      await prisma.volunteerPosition.delete({ where: { id: positionId } });
    }
    revalidatePath(`/admin/volunteers/teams/${pos.teamId}`);
    return { ok: true };
  } catch (e) {
    console.error("[deletePosition]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
