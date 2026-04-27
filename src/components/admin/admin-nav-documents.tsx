"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AdminNavItem } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";

export function AdminNavDocuments({
  items,
}: {
  items: readonly AdminNavItem[];
}) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  if (items.length === 0) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("nav.modulesGroup")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.comingSoon) {
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  aria-disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Icon />
                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {tCommon("soon")}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={active}>
                <Link href={item.href}>
                  <Icon />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
