"use client";

import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { adminNav } from "@/config/nav";
import { usePathname } from "@/lib/i18n/navigation";

export function AdminHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const title = derivePageTitle(pathname, t);

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-t-xl supports-[backdrop-filter]:bg-background/80">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}

function derivePageTitle(
  pathname: string,
  t: (key: string) => string,
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[0] !== "admin") return t("nav.dashboard");

  const sectionPath = `/admin/${segments[1]}`;
  const sectionEntry = adminNav.find((item) => item.href === sectionPath);
  return sectionEntry ? t(sectionEntry.labelKey) : titleCase(segments[1]);
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
