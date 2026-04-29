import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const adminListSelect = {
  id: true,
  title: true,
  body: true,
  isAnonymous: true,
  isPublic: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  memberId: true,
  submittedBy: true,
  member: {
    select: { id: true, fullName: true, phone: true, photoUrl: true },
  },
} as const satisfies Prisma.PrayerRequestSelect;

export type PrayerRequestAdminItem = Prisma.PrayerRequestGetPayload<{
  select: typeof adminListSelect;
}>;

export type PrayerRequestFilters = {
  status?: string;
  memberId?: string;
  isPublic?: boolean;
};

export async function listPrayerRequests(opts?: {
  filters?: PrayerRequestFilters;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.PrayerRequestWhereInput = {};
  const f = opts?.filters;
  if (f?.status) where.status = f.status as never;
  if (f?.memberId) where.memberId = f.memberId;
  if (f?.isPublic !== undefined) where.isPublic = f.isPublic;

  const [items, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
      select: adminListSelect,
    }),
    prisma.prayerRequest.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getPrayerRequest(id: string) {
  return prisma.prayerRequest.findUnique({
    where: { id },
    select: adminListSelect,
  });
}

export async function listPrayerRequestsForMember(memberId: string) {
  return prisma.prayerRequest.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      isAnonymous: true,
      isPublic: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function countOpenPrayerRequests() {
  return prisma.prayerRequest.count({
    where: { status: { in: ["OPEN", "PRAYING"] } },
  });
}
