"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  guestRsvpInputSchema,
  memberRsvpInputSchema,
  type GuestRsvpInput,
  type MemberRsvpInput,
} from "@/lib/validation/event";

export type RsvpResult =
  | { ok: true; data: { id: string; status: string; waitlisted: boolean } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function autoStatusForCapacity(
  eventId: string,
  desired: "GOING" | "MAYBE" | "NOT_GOING" | "WAITLIST",
  excludingRsvpId?: string,
): Promise<{ status: typeof desired | "WAITLIST"; waitlisted: boolean }> {
  if (desired !== "GOING") return { status: desired, waitlisted: false };
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { capacity: true },
  });
  if (!event?.capacity) return { status: "GOING", waitlisted: false };

  const goingCount = await prisma.eventRsvp.count({
    where: {
      eventId,
      status: "GOING",
      ...(excludingRsvpId ? { id: { not: excludingRsvpId } } : {}),
    },
  });
  if (goingCount >= event.capacity) {
    return { status: "WAITLIST", waitlisted: true };
  }
  return { status: "GOING", waitlisted: false };
}

export async function memberRsvpAction(
  eventId: string,
  input: MemberRsvpInput,
): Promise<RsvpResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  const memberId = session.user.memberId;
  if (!memberId) return { ok: false, error: "NO_MEMBER_LINKED" };

  const parsed = memberRsvpInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null, isPublished: true },
    select: { id: true, registrationOpen: true, requiresRsvp: true },
  });
  if (!event) return { ok: false, error: "EVENT_NOT_FOUND" };
  if (!event.registrationOpen) return { ok: false, error: "REGISTRATION_CLOSED" };
  if (!event.requiresRsvp) return { ok: false, error: "NO_RSVP_REQUIRED" };

  const existing = await prisma.eventRsvp.findFirst({
    where: { eventId, memberId },
    select: { id: true },
  });

  const { status, waitlisted } = await autoStatusForCapacity(
    eventId,
    data.status,
    existing?.id,
  );

  try {
    const record = existing
      ? await prisma.eventRsvp.update({
          where: { id: existing.id },
          data: { status, notes: data.notes },
          select: { id: true, status: true },
        })
      : await prisma.eventRsvp.create({
          data: {
            eventId,
            memberId,
            status,
            notes: data.notes,
            guestCount: 1,
          },
          select: { id: true, status: true },
        });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/me/events`);
    revalidatePath(`/me/events/${eventId}`);
    return {
      ok: true,
      data: { id: record.id, status: record.status, waitlisted },
    };
  } catch (e) {
    console.error("[memberRsvp]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function adminGuestRsvpAction(
  eventId: string,
  input: GuestRsvpInput,
): Promise<RsvpResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = guestRsvpInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true },
  });
  if (!event) return { ok: false, error: "EVENT_NOT_FOUND" };

  const { status, waitlisted } = await autoStatusForCapacity(eventId, data.status);

  try {
    const record = await prisma.eventRsvp.create({
      data: {
        eventId,
        guestName: data.guestName.trim(),
        guestPhone: data.guestPhone,
        guestCount: data.guestCount,
        status,
        notes: data.notes,
      },
      select: { id: true, status: true },
    });
    revalidatePath(`/admin/events/${eventId}`);
    return {
      ok: true,
      data: { id: record.id, status: record.status, waitlisted },
    };
  } catch (e) {
    console.error("[adminGuestRsvp]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteRsvpAction(
  rsvpId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const rsvp = await prisma.eventRsvp.findUnique({
    where: { id: rsvpId },
    select: { id: true, eventId: true, memberId: true },
  });
  if (!rsvp) return { ok: false, error: "NOT_FOUND" };

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "STAFF";
  const isOwn =
    !!rsvp.memberId && rsvp.memberId === (session.user.memberId ?? null);
  if (!isStaff && !isOwn) return { ok: false, error: "FORBIDDEN" };

  try {
    await prisma.eventRsvp.delete({ where: { id: rsvpId } });
    revalidatePath(`/admin/events/${rsvp.eventId}`);
    revalidatePath(`/me/events`);
    revalidatePath(`/me/events/${rsvp.eventId}`);
    return { ok: true };
  } catch (e) {
    console.error("[deleteRsvp]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
