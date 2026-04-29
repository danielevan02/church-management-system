"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { canAccessCellGroup, hasAtLeastRole, requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  pastoralVisitInputSchema,
  type PastoralVisitInput,
} from "@/lib/validation/pastoral";

export type VisitResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function assertCanWriteVisitForMember(
  user: { role: import("@prisma/client").Role; memberId: string | null; id: string },
  memberId: string,
): Promise<true | { error: string }> {
  if (hasAtLeastRole(user.role, "STAFF")) return true;
  if (user.role !== "LEADER" || !user.memberId) return { error: "FORBIDDEN" };
  const groups = await prisma.cellGroupMember.findMany({
    where: { memberId },
    select: { cellGroupId: true },
  });
  for (const g of groups) {
    if (await canAccessCellGroup({ id: user.id, role: user.role, memberId: user.memberId }, g.cellGroupId)) {
      return true;
    }
  }
  return { error: "FORBIDDEN" };
}

export async function createPastoralVisitAction(
  input: PastoralVisitInput,
): Promise<VisitResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF", "LEADER"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = pastoralVisitInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const access = await assertCanWriteVisitForMember(
    {
      id: session.user.id,
      role: session.user.role,
      memberId: session.user.memberId ?? null,
    },
    data.memberId,
  );
  if (access !== true) return { ok: false, error: access.error };

  try {
    const record = await prisma.pastoralVisit.create({
      data: {
        memberId: data.memberId,
        visitType: data.visitType,
        visitedAt: data.visitedAt,
        visitedBy: session.user.email ?? "unknown",
        notes: data.notes,
        followUp: data.followUp,
        followUpDate: data.followUpDate,
      },
      select: { id: true },
    });
    revalidatePath("/admin/pastoral");
    revalidatePath(`/admin/members/${data.memberId}`);
    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[createPastoralVisit]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updatePastoralVisitAction(
  id: string,
  input: PastoralVisitInput,
): Promise<VisitResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF", "LEADER"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = pastoralVisitInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const access = await assertCanWriteVisitForMember(
    {
      id: session.user.id,
      role: session.user.role,
      memberId: session.user.memberId ?? null,
    },
    data.memberId,
  );
  if (access !== true) return { ok: false, error: access.error };

  try {
    await prisma.pastoralVisit.update({
      where: { id },
      data: {
        memberId: data.memberId,
        visitType: data.visitType,
        visitedAt: data.visitedAt,
        notes: data.notes,
        followUp: data.followUp,
        followUpDate: data.followUpDate,
      },
    });
    revalidatePath("/admin/pastoral");
    revalidatePath(`/admin/pastoral/${id}`);
    revalidatePath(`/admin/members/${data.memberId}`);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updatePastoralVisit]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deletePastoralVisitAction(
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
    const record = await prisma.pastoralVisit.findUnique({
      where: { id },
      select: { memberId: true },
    });
    if (!record) return { ok: false, error: "NOT_FOUND" };
    await prisma.pastoralVisit.delete({ where: { id } });
    revalidatePath("/admin/pastoral");
    revalidatePath(`/admin/members/${record.memberId}`);
    return { ok: true };
  } catch (e) {
    console.error("[deletePastoralVisit]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
