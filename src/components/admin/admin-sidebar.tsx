"use client";

import type { Role } from "@prisma/client";
import Image from "next/image";
import * as React from "react";

import { AdminNavDocuments } from "@/components/admin/admin-nav-documents";
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
} from "@/components/ui/sidebar";
import { church } from "@/config/church";
import { features } from "@/config/features";
import { visibleAdminNav } from "@/config/nav";
import { Link } from "@/lib/i18n/navigation";

type Props = React.ComponentProps<typeof Sidebar> & {
  user: {
    email: string | null;
    role: Role;
    memberId: string | null;
  };
};

export function AdminSidebar({ user, ...props }: Props) {
  const allItems = React.useMemo(
    () =>
      visibleAdminNav(user.role).filter(
        (item) => !item.feature || features[item.feature],
      ),
    [user.role],
  );

  const main = allItems.filter((i) => i.group === "main");
  const documents = allItems.filter((i) => i.group === "documents");
  const secondary = allItems.filter((i) => i.group === "secondary");

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto items-center py-2 data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin/dashboard">
                <Image
                  src="/icon-ui-192.png"
                  alt=""
                  aria-hidden
                  width={20}
                  height={20}
                  priority
                  className="size-5! object-contain"
                />
                <span className="line-clamp-2 text-sm font-semibold leading-tight whitespace-normal!">
                  {church.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={main} />
        <AdminNavDocuments items={documents} />
        <AdminNavSecondary items={secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
