"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  devotionalInputSchema,
  type DevotionalInput,
} from "@/lib/validation/devotional";

export type UpdateDevotionalResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateDevotionalAction(
  id: string,
  input: DevotionalInput,
): Promise<UpdateDevotionalResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = devotionalInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.devotional.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };

    await prisma.devotional.update({
      where: { id },
      data: {
        title: data.title,
        verseRef: data.verseRef || null,
        verseText: data.verseText || null,
        body: data.body,
        authorName: data.authorName || null,
        publishedAt: data.publishedAt ?? undefined,
      },
    });
    revalidatePath("/admin/devotionals");
    revalidatePath("/me/devotionals");
    revalidatePath("/me/dashboard");
    revalidatePath(`/admin/devotionals/${id}`);
    revalidatePath(`/me/devotionals/${id}`);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
