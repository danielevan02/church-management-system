"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  templateInputSchema,
  type TemplateInput,
} from "@/lib/validation/communications";

export type TemplateActionResult =
  | { ok: true; data?: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createTemplateAction(
  input: TemplateInput,
): Promise<TemplateActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = templateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    const tpl = await prisma.messageTemplate.create({
      data: {
        name: data.name.trim(),
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive,
      },
      select: { id: true },
    });
    revalidatePath("/admin/communications/templates");
    return { ok: true, data: { id: tpl.id } };
  } catch (e) {
    console.error("[createTemplate]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function updateTemplateAction(
  id: string,
  input: TemplateInput,
): Promise<TemplateActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = templateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  try {
    await prisma.messageTemplate.update({
      where: { id },
      data: {
        name: data.name.trim(),
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/communications/templates");
    revalidatePath(`/admin/communications/templates/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateTemplate]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteTemplateAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.messageTemplate.delete({ where: { id } });
    revalidatePath("/admin/communications/templates");
    return { ok: true };
  } catch (e) {
    console.error("[deleteTemplate]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
