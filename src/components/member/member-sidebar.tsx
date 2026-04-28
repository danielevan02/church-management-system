"use client";

import { Church, LogOut, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { church } from "@/config/church";
import { features } from "@/config/features";
import { memberNav } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { signOutAction } from "@/server/actions/auth/sign-out";

type ShellMember = {
  firstName: string;
  fullName: string;
  photoUrl: string | null;
};

type Props = React.ComponentProps<typeof Sidebar> & {
  member: ShellMember | null;
};

export function MemberSidebar({ member, ...props }: Props) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const items = React.useMemo(
    () => memberNav.filter((item) => !item.feature || features[item.feature]),
    [],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/me/dashboard">
                <Church className="size-5!" />
                <span className="text-base font-semibold">{church.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
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
      </SidebarContent>

      <SidebarFooter>
        <MemberNavUser member={member} />
      </SidebarFooter>
    </Sidebar>
  );
}

function MemberNavUser({ member }: { member: ShellMember | null }) {
  const t = useTranslations("common");
  const { isMobile } = useSidebar();
  const initial = (member?.firstName ?? "J").charAt(0).toUpperCase();
  const displayName = member?.fullName ?? "Jemaat";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {member?.photoUrl ? (
                  <AvatarImage
                    src={member.photoUrl}
                    alt={displayName}
                    className="rounded-lg"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
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
            <form action={signOutAction}>
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
