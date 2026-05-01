"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  userEditSchema,
  type UserEditInput,
} from "@/lib/validation/users";
import { writeAudit } from "@/server/audit";
import { isMemberLinked } from "@/server/queries/users";

export type UpdateUserResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateUserAction(
  id: string,
  input: UserEditInput,
): Promise<UpdateUserResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = userEditSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, memberId: true },
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  if (id === session.user.id && data.role !== "ADMIN") {
    return { ok: false, error: "CANNOT_DEMOTE_SELF" };
  }
  if (id === session.user.id && !data.isActive) {
    return { ok: false, error: "CANNOT_DEACTIVATE_SELF" };
  }

  if (data.memberId && (await isMemberLinked(data.memberId, id))) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { memberId: ["Anggota sudah terhubung dengan user lain"] },
    };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        role: data.role,
        isActive: data.isActive,
        memberId: data.memberId ?? null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "user.update",
      entityType: "User",
      entityId: id,
      metadata: {
        role: data.role,
        isActive: data.isActive,
        priorRole: existing.role,
      },
    });

    revalidatePath("/admin/settings/users");
    revalidatePath(`/admin/settings/users/${id}`);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateUser]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
