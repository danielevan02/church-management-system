"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { eventInputSchema, type EventInput } from "@/lib/validation/event";

export type UpdateEventResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateEventAction(
  id: string,
  input: EventInput,
): Promise<UpdateEventResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location,
        capacity: data.capacity ?? null,
        registrationOpen: data.registrationOpen,
        requiresRsvp: data.requiresRsvp,
        fee: data.fee,
        isPublished: data.isPublished,
        coverImageUrl: data.coverImageUrl,
      },
    });
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/me/events");
    revalidatePath(`/me/events/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateEvent]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function setEventPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<UpdateEventResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.event.update({ where: { id }, data: { isPublished } });
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/me/events");
    return { ok: true };
  } catch (e) {
    console.error("[setEventPublished]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function softDeleteEventAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
    revalidatePath("/admin/events");
    revalidatePath("/me/events");
    return { ok: true };
  } catch (e) {
    console.error("[softDeleteEvent]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
