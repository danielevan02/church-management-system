"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { eventInputSchema, type EventInput } from "@/lib/validation/event";

export type CreateEventResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEventAction(
  input: EventInput,
): Promise<CreateEventResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "STAFF"]);
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
    const event = await prisma.event.create({
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
      select: { id: true },
    });
    revalidatePath("/admin/events");
    revalidatePath("/me/events");
    return { ok: true, data: { id: event.id } };
  } catch (e) {
    console.error("[createEvent]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
