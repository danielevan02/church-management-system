export const church = {
  name: process.env.NEXT_PUBLIC_CHURCH_NAME ?? "Church Management System",
  shortName: process.env.NEXT_PUBLIC_CHURCH_SHORT_NAME ?? "ChMS",
  domain: process.env.NEXT_PUBLIC_CHURCH_DOMAIN ?? "localhost",
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "id") as "id" | "en",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "#1e3a8a",
  timezone: process.env.APP_TIMEZONE ?? "Asia/Jakarta",
} as const;

export type ChurchConfig = typeof church;
