"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useTransition } from "react";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { routing } from "@/lib/i18n/routing";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const labels: Record<(typeof routing.locales)[number], string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

/**
 * Language picker as a sub-menu item.
 * On mobile, renders an inline collapsible to prevent submenu clipping
 * outside narrow viewports. On desktop, renders a standard DropdownMenuSub.
 */
export function LanguageMenuItem() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  function pick(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Globe className="size-5 text-on-surface-variant" />
            <span>{t("language")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span>{labels[locale as keyof typeof labels] ?? locale}</span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300 ease-emphasized",
                open && "rotate-180"
              )}
            />
          </div>
        </DropdownMenuItem>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-emphasized",
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col">
              {routing.locales.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onSelect={() => pick(l)}
                  className={cn(
                    "pl-11 py-2 text-sm",
                    l === locale ? "font-semibold text-primary" : "text-on-surface"
                  )}
                >
                  <span className="flex w-5 items-center">
                    {l === locale ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : null}
                  </span>
                  <span>{labels[l]}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Globe />
        <span>{t("language")}</span>
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
            <span>{labels[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

