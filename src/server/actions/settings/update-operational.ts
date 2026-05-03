"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  APP_SETTING_KEYS,
  operationalSettingsSchema,
  type OperationalSettingsInput,
} from "@/lib/validation/settings";
import { writeAudit } from "@/server/audit";

export type UpdateOperationalSettingsResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateOperationalSettingsAction(
  input: OperationalSettingsInput,
): Promise<UpdateOperationalSettingsResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "ADMIN")) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = operationalSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const entries: { key: string; value: string }[] = [
      { key: APP_SETTING_KEYS.bankAccountHolder, value: data.bankAccountHolder },
      { key: APP_SETTING_KEYS.bankAccountNumber, value: data.bankAccountNumber },
      { key: APP_SETTING_KEYS.qrisImagePath, value: data.qrisImagePath },
      {
        key: APP_SETTING_KEYS.confirmationWhatsApp,
        value: data.confirmationWhatsApp,
      },
    ];

    await prisma.$transaction(
      entries.map((e) =>
        prisma.appSetting.upsert({
          where: { key: e.key },
          create: { key: e.key, value: e.value },
          update: { value: e.value },
        }),
      ),
    );

    await writeAudit({
      userId: session.user.id,
      action: "settings.update_operational",
      entityType: "AppSetting",
      metadata: { keys: entries.map((e) => e.key) },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/give");
    revalidatePath("/me/giving");
    return { ok: true };
  } catch (e) {
    console.error("[updateOperationalSettings]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
