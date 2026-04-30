import "server-only";

import webpush from "web-push";

import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}

export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
};

type SubRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function deliver(sub: SubRow, payload: PushPayload): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 },
    );
    return true;
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    // 404/410 = subscription gone — prune it.
    if (status === 404 || status === 410) {
      await prisma.pushSubscription
        .delete({ where: { id: sub.id } })
        .catch(() => undefined);
    } else {
      console.error("[push] deliver failed", status, err);
    }
    return false;
  }
}

/**
 * Send a push notification to every active member subscription.
 * Returns the number of successful deliveries. Silently no-ops if VAPID
 * keys are not configured — the caller doesn't need to guard.
 */
export async function sendPushToAllMembers(
  payload: PushPayload,
): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany({
    where: { user: { role: "MEMBER", isActive: true } },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subs.length === 0) return 0;

  const results = await Promise.all(subs.map((s) => deliver(s, payload)));
  return results.filter(Boolean).length;
}

/**
 * Send a push notification to a single user's subscriptions.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subs.length === 0) return 0;
  const results = await Promise.all(subs.map((s) => deliver(s, payload)));
  return results.filter(Boolean).length;
}
