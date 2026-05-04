"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { routing } from "@/lib/i18n/routing";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

const labels: Record<(typeof routing.locales)[number], string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

/**
 * Language picker as a sub-menu item — drop into any DropdownMenuContent
 * (admin nav user, member sidebar nav user, etc.) so locale can be
 * switched from anywhere, not just the landing page.
 */
export function LanguageMenuItem() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function pick(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Globe />
        {t("language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => pick(l)}
            className={l === locale ? "font-medium" : undefined}
          >
            <span className="w-4">
              {l === locale ? <Check className="h-4 w-4" /> : null}
            </span>
            {labels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
