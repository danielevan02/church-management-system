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

/**
 * Public select — deliberately narrower than `devotionalListSelect`.
 *
 * That one carries `createdBy: { username }`, which is a staff account name.
 * It is harmless on an authenticated admin screen and a leak on the landing
 * page, so the public shape is written out rather than reused. `verseText` is
 * included because the landing card quotes the verse rather than the body.
 */
const devotionalPublicSelect = {
  id: true,
  slug: true,
  title: true,
  verseRef: true,
  verseText: true,
  body: true,
  authorName: true,
  publishedAt: true,
  updatedAt: true,
} as const satisfies Prisma.DevotionalSelect;

export type DevotionalPublicItem = Prisma.DevotionalGetPayload<{
  select: typeof devotionalPublicSelect;
}>;

/**
 * Devotionals for the public landing page: live, not soft-deleted, newest
 * first. Same `publishedAt <= now` gate as the member list, so scheduling a
 * devotional keeps it off the public page until its date.
 */
export async function listPublicDevotionals(
  take = 3,
): Promise<DevotionalPublicItem[]> {
  return prisma.devotional.findMany({
    where: { deletedAt: null, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    select: devotionalPublicSelect,
  });
}

/**
 * The gate every public read shares: published, not scheduled for the future,
 * not soft-deleted.
 *
 * Written once and reused rather than repeated at each call site, because the
 * cost of getting it wrong is asymmetric. A missing `deletedAt` here does not
 * fail loudly — it silently republishes something a pastor deliberately took
 * down, to the whole internet, and to search-engine caches that will keep it
 * long after anyone notices.
 */
function publicWhere(): Prisma.DevotionalWhereInput {
  // A function rather than a constant: a module-level `new Date()` freezes the
  // cutoff at process start, so a devotional scheduled for 09:00 would stay
  // invisible until the server happened to restart.
  return { deletedAt: null, publishedAt: { lte: new Date() } };
}

/**
 * One devotional for its public page, addressed by slug.
 *
 * Returns null rather than throwing for anything not publicly readable, so the
 * route can `notFound()` and a scheduled or withdrawn devotional is
 * indistinguishable from one that never existed.
 */
export async function getPublicDevotionalBySlug(
  slug: string,
): Promise<DevotionalPublicItem | null> {
  return prisma.devotional.findFirst({
    where: { slug, ...publicWhere() },
    select: devotionalPublicSelect,
  });
}

/**
 * A page of the public archive, newest first.
 */
export async function listPublicDevotionalsPage(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(Math.max(opts?.pageSize ?? 12, 1), 50);
  const page = Math.max(opts?.page ?? 1, 1);
  const where = publicWhere();

  const [items, total] = await Promise.all([
    prisma.devotional.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: devotionalPublicSelect,
    }),
    prisma.devotional.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * The devotionals published either side of this one.
 *
 * Internal links between articles are the cheapest SEO a content archive has —
 * they give a crawler a path through every devotional without depending on the
 * paginated index — and they are also simply how a reader expects to move
 * through a series of daily readings.
 */
export async function getAdjacentPublicDevotionals(publishedAt: Date) {
  const [previous, next] = await Promise.all([
    prisma.devotional.findFirst({
      where: { ...publicWhere(), publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.devotional.findFirst({
      where: {
        deletedAt: null,
        publishedAt: { gt: publishedAt, lte: new Date() },
      },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);
  return { previous, next };
}

/** Every public devotional, for the sitemap and for static generation. */
export async function listPublicDevotionalSlugs() {
  return prisma.devotional.findMany({
    where: publicWhere(),
    orderBy: { publishedAt: "desc" },
    select: { slug: true, updatedAt: true, publishedAt: true },
  });
}
