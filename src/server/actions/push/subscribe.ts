"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({
  endpoint: z.string().url().min(1).max(2048),
  p256dh: z.string().min(1).max(512),
  auth: z.string().min(1).max(512),
  userAgent: z.string().max(512).optional(),
});

export type SubscribePushResult =
  | { ok: true }
  | { ok: false; error: string };

export async function subscribePushAction(
  input: z.infer<typeof subscribeSchema>,
): Promise<SubscribePushResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  const data = parsed.data;
  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: {
        userId: session.user.id,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        lastSeenAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[subscribePush]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
