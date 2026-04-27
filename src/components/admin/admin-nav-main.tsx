"use client";

import { Mail, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AdminNavItem } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";

export function AdminNavMain({
  items,
}: {
  items: readonly AdminNavItem[];
}) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const tQuick = useTranslations("nav.quick");
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip={tQuick("create")}
              className="bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8"
            >
              <Link href="/admin/members/new">
                <PlusCircle />
                <span>{tQuick("create")}</span>
              </Link>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              aria-label={tQuick("inbox")}
              disabled
            >
              <Mail />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

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
                    <span className="flex-1 truncate">
                      {t(item.labelKey)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] group-data-[collapsible=icon]:hidden"
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
                  <Link href={item.href}>
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
