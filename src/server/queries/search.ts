import "server-only";

import { prisma } from "@/lib/prisma";

const PER_TYPE = 8;

export type SearchResults = {
  members: Array<{
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    photoUrl: string | null;
  }>;
  households: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
  cellGroups: Array<{
    id: string;
    name: string;
    leaderName: string | null;
  }>;
  events: Array<{
    id: string;
    title: string;
    startsAt: Date;
    location: string | null;
  }>;
};

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) {
    return { members: [], households: [], cellGroups: [], events: [] };
  }

  const [members, households, cellGroupsRaw, events] = await Promise.all([
    prisma.member.findMany({
      where: {
        deletedAt: null,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { nickname: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: PER_TYPE,
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        photoUrl: true,
      },
    }),
    prisma.household.findMany({
      where: {
        deletedAt: null,
        name: { contains: q, mode: "insensitive" },
      },
      take: PER_TYPE,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.cellGroup.findMany({
      where: {
        deletedAt: null,
        name: { contains: q, mode: "insensitive" },
      },
      take: PER_TYPE,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        leader: { select: { fullName: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      take: PER_TYPE,
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        title: true,
        startsAt: true,
        location: true,
      },
    }),
  ]);

  return {
    members,
    households: households.map((h) => ({
      id: h.id,
      name: h.name,
      memberCount: h._count.members,
    })),
    cellGroups: cellGroupsRaw.map((g) => ({
      id: g.id,
      name: g.name,
      leaderName: g.leader?.fullName ?? null,
    })),
    events,
  };
}
