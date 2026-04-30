import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const announcementListSelect = {
  id: true,
  title: true,
  body: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, email: true } },
} as const satisfies Prisma.AnnouncementSelect;

export type AnnouncementListItem = Prisma.AnnouncementGetPayload<{
  select: typeof announcementListSelect;
}>;

/**
 * Admin list — includes drafts/scheduled (publishedAt in future) and
 * everything except soft-deleted.
 */
export async function listAnnouncements(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.AnnouncementWhereInput = { deletedAt: null };

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: announcementListSelect,
    }),
    prisma.announcement.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

/**
 * Member-facing list — only announcements that are already live
 * (publishedAt <= now).
 */
export async function listAnnouncementsForMember(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.AnnouncementWhereInput = {
    deletedAt: null,
    publishedAt: { lte: new Date() },
  };

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        body: true,
        publishedAt: true,
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getAnnouncement(id: string) {
  return prisma.announcement.findFirst({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { id: true, email: true } },
    },
  });
}

/**
 * Member-facing detail — only resolves if the announcement is live
 * (publishedAt <= now), so members can't access scheduled-but-unpublished
 * ones via direct URL.
 */
export async function getAnnouncementForMember(id: string) {
  return prisma.announcement.findFirst({
    where: { id, deletedAt: null, publishedAt: { lte: new Date() } },
    select: {
      id: true,
      title: true,
      body: true,
      publishedAt: true,
    },
  });
}

export async function getLatestAnnouncementsForMember(take = 3) {
  return prisma.announcement.findMany({
    where: { deletedAt: null, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      body: true,
      publishedAt: true,
    },
  });
}
