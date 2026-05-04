"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { canAccessCellGroup } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  cellGroupReportInputSchema,
  type CellGroupReportInput,
} from "@/lib/validation/cell-group";

export type CreateReportResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createCellGroupReportAction(
  cellGroupId: string,
  input: CellGroupReportInput,
): Promise<CreateReportResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";
  if (!isStaff) {
    const allowed = await canAccessCellGroup(
      {
        id: session.user.id ?? "",
        role: session.user.role,
        memberId: session.user.memberId ?? null,
      },
      cellGroupId,
    );
    if (!allowed) return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = cellGroupReportInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const report = await prisma.cellGroupReport.create({
      data: {
        cellGroupId,
        meetingDate: data.meetingDate,
        attendeeCount: data.attendeeCount,
        visitorCount: data.visitorCount,
        topic: data.topic,
        notes: data.notes,
        submittedBy: session.user.username ?? "unknown",
      },
      select: { id: true },
    });
    revalidatePath(`/admin/cell-groups/${cellGroupId}`);
    return { ok: true, data: { id: report.id } };
  } catch (e) {
    console.error("[createCellGroupReport]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteCellGroupReportAction(
  cellGroupId: string,
  reportId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";
  if (!isStaff) {
    const allowed = await canAccessCellGroup(
      {
        id: session.user.id ?? "",
        role: session.user.role,
        memberId: session.user.memberId ?? null,
      },
      cellGroupId,
    );
    if (!allowed) return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.cellGroupReport.delete({ where: { id: reportId } });
    revalidatePath(`/admin/cell-groups/${cellGroupId}`);
    return { ok: true };
  } catch (e) {
    console.error("[deleteCellGroupReport]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
