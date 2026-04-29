"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { email } from "@/lib/email";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  campaignInputSchema,
  type CampaignInput,
} from "@/lib/validation/communications";
import { whatsapp } from "@/lib/whatsapp";
import { resolveAudience } from "@/server/queries/communications";

export type CreateCampaignResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createCampaignAction(
  input: CampaignInput,
): Promise<CreateCampaignResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = campaignInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const recipientCount = (
      await resolveAudience(data.audience, data.channel)
    ).length;
    const campaign = await prisma.broadcastCampaign.create({
      data: {
        name: data.name.trim(),
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        audienceJson: data.audience,
        createdBy: session.user.email ?? "unknown",
        status: "DRAFT",
        totalCount: recipientCount,
      },
      select: { id: true },
    });
    revalidatePath("/admin/communications");
    return { ok: true, data: { id: campaign.id } };
  } catch (e) {
    console.error("[createCampaign]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export type SendCampaignResult =
  | { ok: true; data: { sent: number; failed: number; total: number } }
  | { ok: false; error: string };

export async function sendCampaignAction(
  campaignId: string,
): Promise<SendCampaignResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const campaign = await prisma.broadcastCampaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign) return { ok: false, error: "NOT_FOUND" };
  if (campaign.status === "SENT" || campaign.status === "SENDING") {
    return { ok: false, error: "ALREADY_SENT" };
  }

  await prisma.broadcastCampaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" },
  });

  const audience = campaign.audienceJson as never;
  const recipients = await resolveAudience(audience, campaign.channel);

  const wa = whatsapp();
  const mail = email();
  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    const recipient =
      campaign.channel === "EMAIL"
        ? r.email
        : campaign.channel === "WHATSAPP" || campaign.channel === "SMS"
          ? r.phone
          : null;

    if (!recipient) {
      await prisma.messageDelivery.create({
        data: {
          campaignId,
          channel: campaign.channel,
          recipient: r.email ?? r.phone ?? "(none)",
          memberId: r.id,
          body: campaign.body,
          status: "FAILED",
          errorMessage: "MISSING_CONTACT",
        },
      });
      failed += 1;
      continue;
    }

    try {
      let externalRef: string | null = null;
      if (campaign.channel === "WHATSAPP") {
        const result = await wa.sendMessage({ to: recipient, body: campaign.body });
        externalRef = result.id;
      } else if (campaign.channel === "EMAIL") {
        const result = await mail.sendMessage({
          to: recipient,
          subject: campaign.subject ?? "(no subject)",
          body: campaign.body,
        });
        externalRef = result.id;
      } else {
        // SMS / PUSH currently fall through to the WA stub for now.
        const result = await wa.sendMessage({ to: recipient, body: campaign.body });
        externalRef = result.id;
      }
      await prisma.messageDelivery.create({
        data: {
          campaignId,
          channel: campaign.channel,
          recipient,
          memberId: r.id,
          body: campaign.body,
          status: "SENT",
          sentAt: new Date(),
          externalRef,
        },
      });
      sent += 1;
    } catch (e) {
      console.error("[sendCampaign delivery]", e);
      await prisma.messageDelivery.create({
        data: {
          campaignId,
          channel: campaign.channel,
          recipient,
          memberId: r.id,
          body: campaign.body,
          status: "FAILED",
          errorMessage: e instanceof Error ? e.message : "UNKNOWN",
        },
      });
      failed += 1;
    }
  }

  await prisma.broadcastCampaign.update({
    where: { id: campaignId },
    data: {
      status: failed > 0 && sent === 0 ? "FAILED" : "SENT",
      sentAt: new Date(),
      totalCount: recipients.length,
      successCount: sent,
      failureCount: failed,
    },
  });

  revalidatePath("/admin/communications");
  revalidatePath(`/admin/communications/${campaignId}`);

  return { ok: true, data: { sent, failed, total: recipients.length } };
}

export async function deleteCampaignAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    await prisma.messageDelivery.deleteMany({ where: { campaignId: id } });
    await prisma.broadcastCampaign.delete({ where: { id } });
    revalidatePath("/admin/communications");
    return { ok: true };
  } catch (e) {
    console.error("[deleteCampaign]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
