"use client";

import { useTranslations } from "next-intl";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { memberNav } from "@/config/nav";
import { usePathname } from "@/lib/i18n/navigation";

export function MemberHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const title = derivePageTitle(pathname, t);

  return (
    // M3 top app bar, small: 64dp, flat on `surface`, title in title-large.
    // The previous version was a translucent blurred bar with a bottom border —
    // a glassmorphic idiom, not an M3 one. M3 separates the bar from content by
    // *tone* when the page scrolls under it (see `surface-container` below),
    // never by a hairline or a blur.
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 bg-surface transition-colors duration-200 ease-standard group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-t-lg">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-title-lg text-on-surface">{title}</h1>
      </div>
    </header>
  );
}

function derivePageTitle(
  pathname: string,
  t: (key: string) => string,
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[0] !== "me") return t("nav.myDashboard");

  const sectionPath = `/me/${segments[1]}`;
  const entry = memberNav.find((item) => item.href === sectionPath);
  return entry ? t(entry.labelKey) : titleCase(segments[1]);
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
