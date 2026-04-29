import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const auditListSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  ipAddress: true,
  createdAt: true,
  user: {
    select: { id: true, email: true, role: true },
  },
} as const satisfies Prisma.AuditLogSelect;

export type AuditLogItem = Prisma.AuditLogGetPayload<{
  select: typeof auditListSelect;
}>;

export type AuditFilters = {
  action?: string;
  entityType?: string;
  userId?: string;
  from?: Date;
  to?: Date;
};

function buildAuditWhere(filters?: AuditFilters): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (!filters) return where;
  if (filters.action) where.action = filters.action;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.userId) where.userId = filters.userId;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }
  return where;
}

export async function listAuditLogs(opts?: {
  filters?: AuditFilters;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where = buildAuditWhere(opts?.filters);

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: auditListSelect,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function listRecentAuditLogs(take = 10) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: auditListSelect,
  });
}
