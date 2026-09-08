"use client";

import type { Role } from "@prisma/client";
import Image from "next/image";
import * as React from "react";

import { AdminNavGroup } from "@/components/admin/admin-nav-group";
import { AdminNavMain } from "@/components/admin/admin-nav-main";
import { AdminNavSecondary } from "@/components/admin/admin-nav-secondary";
import { AdminNavUser } from "@/components/admin/admin-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { church } from "@/config/church";
import { features } from "@/config/features";
import { visibleAdminNav } from "@/config/nav";
import { Link } from "@/lib/i18n/navigation";

type Props = React.ComponentProps<typeof Sidebar> & {
  user: {
    username: string | null;
    role: Role;
    memberId: string | null;
    member: {
      firstName: string;
      lastName: string | null;
      photoUrl: string | null;
    } | null;
  };
};

const ADMIN_SECTIONS = [
  { group: "people", labelKey: "nav.groups.people" },
  { group: "ministry", labelKey: "nav.groups.ministry" },
  { group: "communication", labelKey: "nav.groups.communication" },
  { group: "finance", labelKey: "nav.groups.finance" },
] as const;

export function AdminSidebar({ user, ...props }: Props) {
  const allItems = React.useMemo(
    () =>
      visibleAdminNav(user.role).filter(
        (item) => !item.feature || features[item.feature],
      ),
    [user.role],
  );

  const overview = allItems.filter((i) => i.group === "overview");
  const secondary = allItems.filter((i) => i.group === "system");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip={church.name}
              className="h-auto items-center py-2 data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/admin/dashboard" prefetch={true} className="flex items-center gap-2.5">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                  <Image
                    src="/icon-ui-192.png"
                    alt=""
                    aria-hidden
                    width={20}
                    height={20}
                    priority
                    className="size-5! object-contain"
                  />
                </div>
                <span className="line-clamp-2 text-sm font-semibold leading-tight whitespace-normal! m3-sidebar-label">
                  {church.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AdminNavMain items={overview} />
        {ADMIN_SECTIONS.map((section) => {
          const sectionItems = allItems.filter((i) => i.group === section.group);
          return (
            <AdminNavGroup
              key={section.group}
              labelKey={section.labelKey}
              items={sectionItems}
            />
          );
        })}
        <AdminNavSecondary items={secondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <AdminNavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

