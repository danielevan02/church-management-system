import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const milestoneListSelect = {
  id: true,
  type: true,
  achievedAt: true,
  notes: true,
  recordedBy: true,
  createdAt: true,
  member: {
    select: { id: true, fullName: true, phone: true, photoUrl: true },
  },
} as const satisfies Prisma.DiscipleshipMilestoneSelect;

export type MilestoneListItem = Prisma.DiscipleshipMilestoneGetPayload<{
  select: typeof milestoneListSelect;
}>;

export type MilestoneFilters = {
  memberId?: string;
  type?: string;
  from?: Date;
  to?: Date;
};

export async function listMilestones(opts?: { filters?: MilestoneFilters }) {
  const where: Prisma.DiscipleshipMilestoneWhereInput = {};
  if (opts?.filters?.memberId) where.memberId = opts.filters.memberId;
  if (opts?.filters?.type) where.type = opts.filters.type;
  if (opts?.filters?.from || opts?.filters?.to) {
    where.achievedAt = {};
    if (opts.filters.from) where.achievedAt.gte = opts.filters.from;
    if (opts.filters.to) where.achievedAt.lte = opts.filters.to;
  }

  return prisma.discipleshipMilestone.findMany({
    where,
    orderBy: { achievedAt: "desc" },
    select: milestoneListSelect,
  });
}

export async function getMilestonesForMember(memberId: string) {
  return prisma.discipleshipMilestone.findMany({
    where: { memberId },
    orderBy: { achievedAt: "asc" },
    select: {
      id: true,
      type: true,
      achievedAt: true,
      notes: true,
      recordedBy: true,
    },
  });
}

export async function getMilestone(id: string) {
  return prisma.discipleshipMilestone.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, fullName: true } },
    },
  });
}
