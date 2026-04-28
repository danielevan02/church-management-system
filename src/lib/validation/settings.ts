import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? "" : v.trim()));

export const operationalSettingsSchema = z.object({
  bankAccountHolder: empty,
  bankAccountNumber: empty,
  qrisImagePath: empty,
  confirmationWhatsApp: empty,
});

export type OperationalSettingsInput = z.input<typeof operationalSettingsSchema>;
export type OperationalSettings = z.output<typeof operationalSettingsSchema>;

export const APP_SETTING_KEYS = {
  bankAccountHolder: "bank.accountHolder",
  bankAccountNumber: "bank.accountNumber",
  qrisImagePath: "bank.qrisImagePath",
  confirmationWhatsApp: "bank.confirmationWhatsApp",
} as const;
