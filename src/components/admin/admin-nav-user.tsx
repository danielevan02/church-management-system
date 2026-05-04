"use client";

import type { Role } from "@prisma/client";
import { LogOut, MoreVertical, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";

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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@/lib/i18n/navigation";
import { signOutAction } from "@/server/actions/auth/sign-out";

export function AdminNavUser({
  user,
}: {
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
}) {
  const t = useTranslations("common");
  const { isMobile } = useSidebar();

  // Prefer the linked member's first+last name when available — that's
  // the human identifier admins recognise. Fall back to the username for
  // staff accounts that aren't linked to a member.
  const displayName = user.member
    ? [user.member.firstName, user.member.lastName].filter(Boolean).join(" ")
    : user.username ?? user.role;
  const initial = displayName.charAt(0).toUpperCase();
  const photoUrl = user.member?.photoUrl ?? null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.role}
                </span>
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
                  {photoUrl ? (
                    <AvatarImage src={photoUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.memberId ? (
              <DropdownMenuItem asChild>
                <Link href="/me/dashboard" className="w-full">
                  <UserCircle />
                  {t("switchToMember")}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <LanguageMenuItem />
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
