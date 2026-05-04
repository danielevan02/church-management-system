"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  userCreateSchema,
  type UserCreateInput,
} from "@/lib/validation/users";
import { writeAudit } from "@/server/audit";
import { isMemberLinked, isUsernameTaken } from "@/server/queries/users";

const HASH_ROUNDS = 10;

export type CreateUserResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createUserAction(
  input: UserCreateInput,
): Promise<CreateUserResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  if (await isUsernameTaken(data.username)) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: { username: ["Username sudah dipakai"] },
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
        username: data.username,
        passwordHash,
        role: data.role,
        memberId: data.memberId ?? null,
      },
      select: { id: true },
    });

    await writeAudit({
      userId: session.user.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { username: data.username, role: data.role },
    });

    revalidatePath("/admin/settings/users");
    return { ok: true, data: { id: user.id } };
  } catch (e) {
    console.error("[createUser]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
