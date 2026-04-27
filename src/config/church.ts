export const church = {
  name: process.env.NEXT_PUBLIC_CHURCH_NAME ?? "Church Management System",
  shortName: process.env.NEXT_PUBLIC_CHURCH_SHORT_NAME ?? "ChMS",
  domain: process.env.NEXT_PUBLIC_CHURCH_DOMAIN ?? "localhost",
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "id") as "id" | "en",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "#1e3a8a",
  timezone: process.env.APP_TIMEZONE ?? "Asia/Jakarta",
  bank: {
    name: process.env.NEXT_PUBLIC_CHURCH_BANK_NAME ?? "BCA",
    accountNumber: process.env.NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_HOLDER ?? "",
    /** Path under /public to the QRIS image. */
    qrisImagePath:
      process.env.NEXT_PUBLIC_CHURCH_QRIS_IMAGE_PATH ?? "/qris.png",
    /** Optional WhatsApp number members can ping after transferring. */
    confirmationWhatsApp:
      process.env.NEXT_PUBLIC_CHURCH_GIVING_CONFIRM_WA ?? "",
  },
} as const;

export type ChurchConfig = typeof church;
