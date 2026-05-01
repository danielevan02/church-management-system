"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const unsubscribeSchema = z.object({
  endpoint: z.string().url().min(1).max(2048),
});

export type UnsubscribePushResult =
  | { ok: true }
  | { ok: false; error: string };

export async function unsubscribePushAction(
  input: z.infer<typeof unsubscribeSchema>,
): Promise<UnsubscribePushResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = unsubscribeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  try {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: parsed.data.endpoint, userId: session.user.id },
    });
    return { ok: true };
  } catch (e) {
    console.error("[unsubscribePush]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
