import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const eventListSelect = {
  id: true,
  title: true,
  startsAt: true,
  endsAt: true,
  location: true,
  capacity: true,
  isPublished: true,
  registrationOpen: true,
  fee: true,
  coverImageUrl: true,
  _count: {
    select: { rsvps: { where: { status: { in: ["GOING", "WAITLIST"] } } } },
  },
} as const satisfies Prisma.EventSelect;

export type EventListItem = Prisma.EventGetPayload<{
  select: typeof eventListSelect;
}>;

export async function listEvents(opts?: {
  publishedOnly?: boolean;
  upcomingOnly?: boolean;
}) {
  const where: Prisma.EventWhereInput = { deletedAt: null };
  if (opts?.publishedOnly) where.isPublished = true;
  if (opts?.upcomingOnly) where.endsAt = { gte: new Date() };

  return prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    select: eventListSelect,
  });
}

export async function getEvent(id: string) {
  return prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function getEventWithRsvps(id: string) {
  return prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      rsvps: {
        orderBy: { createdAt: "asc" },
        include: {
          member: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function getRsvpsForMember(memberId: string, limit = 25) {
  return prisma.eventRsvp.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          location: true,
          isPublished: true,
        },
      },
    },
  });
}

export async function getUpcomingPublishedEventsForMember(memberId: string) {
  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      endsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    include: {
      rsvps: {
        where: { memberId },
        select: { id: true, status: true, guestCount: true },
      },
      _count: {
        select: { rsvps: { where: { status: { in: ["GOING", "WAITLIST"] } } } },
      },
    },
  });
  return events.map((e) => ({
    ...e,
    myRsvp: e.rsvps[0] ?? null,
  }));
}

export async function countGoingFor(eventId: string) {
  return prisma.eventRsvp.count({
    where: { eventId, status: "GOING" },
  });
}
