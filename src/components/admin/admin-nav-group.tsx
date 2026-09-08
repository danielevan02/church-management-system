"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AdminNavItem } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";

export function AdminNavGroup({
  labelKey,
  items,
}: {
  labelKey: string;
  items: readonly AdminNavItem[];
}) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(labelKey)}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (item.comingSoon) {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={t(item.labelKey)}
                    aria-disabled
                    className="cursor-not-allowed opacity-50"
                  >
                    <Icon />
                    <span className="flex-1 truncate">{t(item.labelKey)}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] m3-sidebar-label"
                    >
                      {tCommon("soon")}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={t(item.labelKey)}
                  isActive={active}
                >
                  <Link href={item.href} prefetch={true}>
                    <Icon />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
