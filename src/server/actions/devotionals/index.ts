"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  devotionalInputSchema,
  type DevotionalInput,
} from "@/lib/validation/devotional";

export type DevotionalActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidate(id?: string) {
  revalidatePath("/admin/devotionals");
  revalidatePath("/me/devotionals");
  revalidatePath("/me/dashboard");
  if (id) {
    revalidatePath(`/admin/devotionals/${id}`);
    revalidatePath(`/me/devotionals/${id}`);
  }
}

export async function createDevotionalAction(
  input: DevotionalInput,
): Promise<DevotionalActionResult<{ id: string }>> {
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
    const devotional = await prisma.devotional.create({
      data: {
        title: data.title,
        verseRef: data.verseRef || null,
        verseText: data.verseText || null,
        body: data.body,
        authorName: data.authorName || null,
        publishedAt: data.publishedAt ?? new Date(),
        createdById: session.user.id ?? null,
      },
      select: { id: true },
    });
    revalidate(devotional.id);
    return { ok: true, data: { id: devotional.id } };
  } catch (e) {
    console.error("[createDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateDevotionalAction(
  id: string,
  input: DevotionalInput,
): Promise<DevotionalActionResult<{ id: string }>> {
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
    revalidate(id);
    return { ok: true, data: { id } };
  } catch (e) {
    console.error("[updateDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteDevotionalAction(
  id: string,
): Promise<DevotionalActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const existing = await prisma.devotional.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };

    await prisma.devotional.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidate();
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("[deleteDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
