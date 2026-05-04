"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { excerpt } from "@/lib/markdown";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendPushToAllMembers } from "@/lib/push";
import {
  devotionalInputSchema,
  type DevotionalInput,
} from "@/lib/validation/devotional";

export type CreateDevotionalResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createDevotionalAction(
  input: DevotionalInput,
): Promise<CreateDevotionalResult> {
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
    const publishedAt = data.publishedAt ?? new Date();
    const devotional = await prisma.devotional.create({
      data: {
        title: data.title,
        verseRef: data.verseRef || null,
        verseText: data.verseText || null,
        body: data.body,
        authorName: data.authorName || null,
        publishedAt,
        createdById: session.user.id ?? null,
      },
      select: { id: true },
    });
    revalidatePath("/admin/devotionals");
    revalidatePath("/me/devotionals");
    revalidatePath("/me/dashboard");
    revalidatePath(`/admin/devotionals/${devotional.id}`);
    revalidatePath(`/me/devotionals/${devotional.id}`);

    if (publishedAt.getTime() <= Date.now()) {
      void sendPushToAllMembers({
        title: `Renungan: ${data.title}`,
        body: excerpt(data.body),
        url: `/me/devotionals/${devotional.id}`,
        tag: `devotional:${devotional.id}`,
      }).catch((e) => console.error("[devotional push fanout]", e));
    }

    return { ok: true, data: { id: devotional.id } };
  } catch (e) {
    console.error("[createDevotional]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
