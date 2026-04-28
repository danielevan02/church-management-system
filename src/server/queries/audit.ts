import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

export async function listAuditLogs(opts?: {
  filters?: AuditFilters;
  take?: number;
}) {
  const where: Prisma.AuditLogWhereInput = {};
  const f = opts?.filters;
  if (f?.action) where.action = f.action;
  if (f?.entityType) where.entityType = f.entityType;
  if (f?.userId) where.userId = f.userId;
  if (f?.from || f?.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = f.from;
    if (f.to) where.createdAt.lte = f.to;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 100,
    select: auditListSelect,
  });
}
