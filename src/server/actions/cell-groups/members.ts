"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { canAccessCellGroup } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type CellGroupMemberResult = { ok: true } | { ok: false; error: string };

const assignSchema = z.object({
  cellGroupId: z.string().min(1),
  memberId: z.string().min(1),
});

async function assertAccess(
  session: { user: { id?: string; role: string; memberId?: string | null } },
  cellGroupId: string,
): Promise<boolean> {
  const role = session.user.role as never;
  const isStaff =
    role === "ADMIN" || role === "STAFF";
  if (isStaff) return true;
  return canAccessCellGroup(
    {
      id: session.user.id ?? "",
      role: session.user.role as never,
      memberId: session.user.memberId ?? null,
    },
    cellGroupId,
  );
}

export async function assignMemberAction(input: {
  cellGroupId: string;
  memberId: string;
}): Promise<CellGroupMemberResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };
  const { cellGroupId, memberId } = parsed.data;

  if (!(await assertAccess(session, cellGroupId))) {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const existing = await prisma.cellGroupMember.findUnique({
      where: {
        cellGroupId_memberId: { cellGroupId, memberId },
      },
      select: { id: true, leftAt: true },
    });

    if (existing && existing.leftAt == null) {
      return { ok: false, error: "ALREADY_MEMBER" };
    }
    if (existing) {
      await prisma.cellGroupMember.update({
        where: { id: existing.id },
        data: { leftAt: null, joinedAt: new Date() },
      });
    } else {
      await prisma.cellGroupMember.create({
        data: { cellGroupId, memberId },
      });
    }

    revalidatePath(`/admin/cell-groups/${cellGroupId}`);
    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/me/cell-group");
    return { ok: true };
  } catch (e) {
    console.error("[assignCellGroupMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function removeMemberAction(input: {
  cellGroupId: string;
  memberId: string;
}): Promise<CellGroupMemberResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };
  const { cellGroupId, memberId } = parsed.data;

  if (!(await assertAccess(session, cellGroupId))) {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.cellGroupMember.update({
      where: { cellGroupId_memberId: { cellGroupId, memberId } },
      data: { leftAt: new Date() },
    });
    revalidatePath(`/admin/cell-groups/${cellGroupId}`);
    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/me/cell-group");
    return { ok: true };
  } catch (e) {
    console.error("[removeCellGroupMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
