"use client";

import type { Role } from "@prisma/client";
import { LayoutDashboard, LogOut, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import * as React from "react";

import { LanguageMenuItem } from "@/components/shared/language-menu-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { church } from "@/config/church";
import { features } from "@/config/features";
import { memberNav } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { signOutMemberAction } from "@/server/actions/auth/sign-out";

type ShellMember = {
  firstName: string;
  fullName: string;
  photoUrl: string | null;
};

type Props = React.ComponentProps<typeof Sidebar> & {
  member: ShellMember | null;
  role: Role;
};

const MEMBER_SECTIONS = [
  { group: "main", labelKey: "nav.memberGroups.main", showLabel: false },
  { group: "worship", labelKey: "nav.memberGroups.worship", showLabel: true },
  { group: "community", labelKey: "nav.memberGroups.community", showLabel: true },
] as const;

export function MemberSidebar({ member, role, ...props }: Props) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const items = React.useMemo(
    () => memberNav.filter((item) => !item.feature || features[item.feature]),
    [],
  );

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
              <Link href="/me/dashboard" prefetch={true} className="flex items-center gap-2.5">
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
        {MEMBER_SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => item.group === section.group);
          if (sectionItems.length === 0) return null;

          return (
            <SidebarGroup key={section.group}>
              {section.showLabel ? (
                <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

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
        })}
      </SidebarContent>

      <SidebarFooter>
        <MemberNavUser member={member} role={role} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function MemberNavUser({
  member,
  role,
}: {
  member: ShellMember | null;
  role: Role;
}) {
  const t = useTranslations("common");
  const { isMobile } = useSidebar();
  const initial = (member?.firstName ?? "J").charAt(0).toUpperCase();
  const displayName = member?.fullName ?? "Jemaat";
  const canAccessAdmin = hasAtLeastRole(role, "LEADER");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={displayName}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                {member?.photoUrl ? (
                  <AvatarImage
                    src={member.photoUrl}
                    alt={displayName}
                    className="rounded-lg"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight m3-sidebar-label">
                <span className="truncate font-medium">{displayName}</span>
              </div>
              <MoreVertical className="ml-auto size-4 m3-sidebar-label" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"}
            align={isMobile ? "center" : "end"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {member?.photoUrl ? (
                    <AvatarImage
                      src={member.photoUrl}
                      alt={displayName}
                      className="rounded-lg"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canAccessAdmin ? (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="w-full">
                  <LayoutDashboard />
                  {t("switchToAdmin")}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <LanguageMenuItem />
            <DropdownMenuSeparator />
            <form action={signOutMemberAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <LogOut />
                  {t("signOut")}
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

