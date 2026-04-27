"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AdminNavItem } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";

export function AdminNavSecondary({
  items,
  ...props
}: {
  items: readonly AdminNavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const t = useTranslations();
  const pathname = usePathname();

  if (items.length === 0) return null;

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Inner = (
              <>
                <Icon />
                <span>{t(item.labelKey)}</span>
              </>
            );

            return (
              <SidebarMenuItem key={item.href}>
                {item.comingSoon ? (
                  <SidebarMenuButton
                    aria-disabled
                    className="cursor-not-allowed opacity-50"
                  >
                    {Inner}
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild isActive={active}>
                    <Link href={item.href}>{Inner}</Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
