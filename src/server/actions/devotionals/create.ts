"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { excerpt } from "@/lib/markdown";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendPushToAllMembers } from "@/lib/push";
import { uniqueDevotionalSlug } from "@/lib/slug";
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

    /*
     * `slug` is unique at the database level, and `uniqueDevotionalSlug`
     * only narrows the window rather than closing it — two admins saving
     * "Renungan Natal" in the same second both read the same free slug and
     * one of them loses. That is a P2002, and it is a retry rather than an
     * error: on the second pass the first row exists, so the helper picks
     * the next number. Three attempts is far past what a human collision
     * needs.
     */
    let devotional: { id: string; slug: string } | null = null;
    for (let attempt = 0; attempt < 3 && !devotional; attempt += 1) {
      try {
        devotional = await prisma.devotional.create({
          data: {
            slug: await uniqueDevotionalSlug(data.title),
            title: data.title,
            verseRef: data.verseRef || null,
            verseText: data.verseText || null,
            body: data.body,
            authorName: data.authorName || null,
            publishedAt,
            createdById: session.user.id ?? null,
          },
          select: { id: true, slug: true },
        });
      } catch (e) {
        const isSlugConflict =
          typeof e === "object" &&
          e !== null &&
          (e as { code?: string }).code === "P2002";
        if (!isSlugConflict || attempt === 2) throw e;
      }
    }
    if (!devotional) return { ok: false, error: "INTERNAL_ERROR" };

    revalidatePath("/admin/devotionals");
    revalidatePath("/me/devotionals");
    revalidatePath("/me/dashboard");
    revalidatePath(`/admin/devotionals/${devotional.id}`);
    revalidatePath(`/me/devotionals/${devotional.id}`);
    // The public archive and the landing page both list devotionals, and a
    // newly published one has to appear on them without waiting for a deploy.
    revalidatePath("/renungan");
    revalidatePath(`/renungan/${devotional.slug}`);
    revalidatePath("/", "page");

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
