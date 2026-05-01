"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  passwordResetSchema,
  type PasswordResetInput,
} from "@/lib/validation/users";
import { writeAudit } from "@/server/audit";

const HASH_ROUNDS = 10;

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function resetPasswordAction(
  id: string,
  input: PasswordResetInput,
): Promise<ResetPasswordResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }

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
      userId: session.user.id,
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
