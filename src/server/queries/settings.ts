import "server-only";

import { prisma } from "@/lib/prisma";
import { APP_SETTING_KEYS } from "@/lib/validation/settings";

export type OperationalOverrides = {
  bankAccountHolder: string;
  bankAccountNumber: string;
  qrisImagePath: string;
  confirmationWhatsApp: string;
};

export async function getOperationalOverrides(): Promise<OperationalOverrides> {
  const rows = await prisma.appSetting.findMany({
    where: { key: { in: Object.values(APP_SETTING_KEYS) } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  function read(key: string): string {
    const v = map.get(key);
    if (typeof v === "string") return v;
    return "";
  }

  return {
    bankAccountHolder: read(APP_SETTING_KEYS.bankAccountHolder),
    bankAccountNumber: read(APP_SETTING_KEYS.bankAccountNumber),
    qrisImagePath: read(APP_SETTING_KEYS.qrisImagePath),
    confirmationWhatsApp: read(APP_SETTING_KEYS.confirmationWhatsApp),
  };
}
