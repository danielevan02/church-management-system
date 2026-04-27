import "server-only";

import type { MessageChannel, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AudienceFilter } from "@/lib/validation/communications";

const templateListSelect = {
  id: true,
  name: true,
  channel: true,
  subject: true,
  body: true,
  isActive: true,
  updatedAt: true,
} as const satisfies Prisma.MessageTemplateSelect;

export type TemplateListItem = Prisma.MessageTemplateGetPayload<{
  select: typeof templateListSelect;
}>;

export async function listTemplates(opts?: { channel?: MessageChannel }) {
  return prisma.messageTemplate.findMany({
    where: opts?.channel ? { channel: opts.channel } : undefined,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: templateListSelect,
  });
}

export async function getTemplate(id: string) {
  return prisma.messageTemplate.findUnique({ where: { id } });
}

const campaignListSelect = {
  id: true,
  name: true,
  channel: true,
  subject: true,
  status: true,
  scheduledAt: true,
  sentAt: true,
  createdAt: true,
  totalCount: true,
  successCount: true,
  failureCount: true,
} as const satisfies Prisma.BroadcastCampaignSelect;

export type CampaignListItem = Prisma.BroadcastCampaignGetPayload<{
  select: typeof campaignListSelect;
}>;

export async function listCampaigns() {
  return prisma.broadcastCampaign.findMany({
    orderBy: { createdAt: "desc" },
    select: campaignListSelect,
  });
}

export async function getCampaign(id: string) {
  return prisma.broadcastCampaign.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          channel: true,
          recipient: true,
          memberId: true,
          status: true,
          sentAt: true,
          deliveredAt: true,
          errorMessage: true,
        },
      },
    },
  });
}

/**
 * Resolve an audience filter into the list of recipients.
 * Always excludes `deletedAt != null` and members with `excludeFromBroadcasts = true`.
 */
export async function resolveAudience(
  filter: AudienceFilter,
  channel: MessageChannel,
) {
  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    excludeFromBroadcasts: false,
  };

  if (filter.kind === "FILTER") {
    if (filter.status) where.status = filter.status;
    if (filter.gender) where.gender = filter.gender;
    if (filter.householdId) where.householdId = filter.householdId;
    if (filter.cellGroupId) {
      where.cellGroupMembers = {
        some: { cellGroupId: filter.cellGroupId, leftAt: null },
      };
    }
  }

  if (channel === "WHATSAPP" || channel === "SMS") {
    where.phone = { not: null };
  }
  if (channel === "EMAIL") {
    where.email = { not: null };
  }

  return prisma.member.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
    },
  });
}

export async function previewAudienceCount(
  filter: AudienceFilter,
  channel: MessageChannel,
) {
  const recipients = await resolveAudience(filter, channel);
  return recipients.length;
}
