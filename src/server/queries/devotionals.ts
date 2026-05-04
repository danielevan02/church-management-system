import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const devotionalListSelect = {
  id: true,
  title: true,
  verseRef: true,
  body: true,
  authorName: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, username: true } },
} as const satisfies Prisma.DevotionalSelect;

export type DevotionalListItem = Prisma.DevotionalGetPayload<{
  select: typeof devotionalListSelect;
}>;

/**
 * Admin list — includes scheduled (publishedAt in future) and excludes
 * soft-deleted only.
 */
export async function listDevotionals(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.DevotionalWhereInput = { deletedAt: null };

  const [items, total] = await Promise.all([
    prisma.devotional.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: devotionalListSelect,
    }),
    prisma.devotional.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

/**
 * Member-facing list — only devotionals already live (publishedAt <= now).
 */
export async function listDevotionalsForMember(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.DevotionalWhereInput = {
    deletedAt: null,
    publishedAt: { lte: new Date() },
  };

  const [items, total] = await Promise.all([
    prisma.devotional.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        verseRef: true,
        body: true,
        authorName: true,
        publishedAt: true,
      },
    }),
    prisma.devotional.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getDevotional(id: string) {
  return prisma.devotional.findFirst({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { id: true, username: true } },
    },
  });
}

/**
 * Member-facing detail — only resolves if live.
 */
export async function getDevotionalForMember(id: string) {
  return prisma.devotional.findFirst({
    where: { id, deletedAt: null, publishedAt: { lte: new Date() } },
    select: {
      id: true,
      title: true,
      verseRef: true,
      verseText: true,
      body: true,
      authorName: true,
      publishedAt: true,
    },
  });
}

/**
 * Latest published devotional for the dashboard card. Returns the most
 * recent published devotional regardless of date (covers cases where
 * today's hasn't been written yet — better to show the latest than empty).
 */
export async function getTodayDevotionalForMember() {
  return prisma.devotional.findFirst({
    where: { deletedAt: null, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      verseRef: true,
      body: true,
      authorName: true,
      publishedAt: true,
    },
  });
}
