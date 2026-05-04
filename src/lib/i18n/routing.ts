import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
  // Always start in Indonesian instead of sniffing Accept-Language —
  // English-browser visitors should still see the Indonesian UI by
  // default and switch via the language menu if they want.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
