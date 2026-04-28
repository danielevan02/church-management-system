"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole, requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  passwordResetSchema,
  userCreateSchema,
  userEditSchema,
  type PasswordResetInput,
  type UserCreateInput,
  type UserEditInput,
} from "@/lib/validation/users";
import { writeAudit } from "@/server/audit";
import { isEmailTaken, isMemberLinked } from "@/server/queries/users";

export type UserActionResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const HASH_ROUNDS = 10;

async function requireAdmin(): Promise<
  | { ok: true; userId: string; role: import("@prisma/client").Role }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }
  return { ok: true, userId: session.user.id, role: session.user.role };
}

export async function createUserAction(
  input: UserCreateInput,
): Promise<UserActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Only SUPER_ADMIN can create another SUPER_ADMIN.
  if (data.role === "SUPER_ADMIN" && guard.role !== "SUPER_ADMIN") {
    return { ok: false, error: "FORBIDDEN" };
  }

  if (await isEmailTaken(data.email)) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { email: ["Email sudah dipakai"] },
    };
  }
  if (data.memberId && (await isMemberLinked(data.memberId))) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { memberId: ["Anggota sudah terhubung dengan user lain"] },
    };
  }

  try {
    const passwordHash = await bcrypt.hash(data.password, HASH_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        memberId: data.memberId ?? null,
      },
      select: { id: true },
    });

    await writeAudit({
      userId: guard.userId,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { email: data.email, role: data.role },
    });

    revalidatePath("/admin/settings/users");
    return { ok: true, data: { id: user.id } };
  } catch (e) {
    console.error("[createUser]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateUserAction(
  id: string,
  input: UserEditInput,
): Promise<UserActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

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

  // Prevent non-super-admin from elevating to SUPER_ADMIN or modifying one.
  if (
    (existing.role === "SUPER_ADMIN" || data.role === "SUPER_ADMIN") &&
    guard.role !== "SUPER_ADMIN"
  ) {
    return { ok: false, error: "FORBIDDEN" };
  }

  // Don't allow demoting yourself out of admin (avoid lockout).
  if (id === guard.userId && data.role !== "SUPER_ADMIN" && data.role !== "ADMIN") {
    return { ok: false, error: "CANNOT_DEMOTE_SELF" };
  }
  // Don't allow deactivating yourself.
  if (id === guard.userId && !data.isActive) {
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
      userId: guard.userId,
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

export async function resetPasswordAction(
  id: string,
  input: PasswordResetInput,
): Promise<{ ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, HASH_ROUNDS);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await writeAudit({
      userId: guard.userId,
      action: "user.reset_password",
      entityType: "User",
      entityId: id,
    });

    revalidatePath(`/admin/settings/users/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[resetPassword]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function toggleUserActiveAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  if (id === session.user.id) {
    return { ok: false, error: "CANNOT_DEACTIVATE_SELF" };
  }

  try {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true, role: true },
    });
    if (!u) return { ok: false, error: "NOT_FOUND" };
    if (u.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { ok: false, error: "FORBIDDEN" };
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: !u.isActive },
    });

    await writeAudit({
      userId: session.user.id,
      action: u.isActive ? "user.deactivate" : "user.activate",
      entityType: "User",
      entityId: id,
    });

    revalidatePath("/admin/settings/users");
    revalidatePath(`/admin/settings/users/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[toggleUserActive]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
