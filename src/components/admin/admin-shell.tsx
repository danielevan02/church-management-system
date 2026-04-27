"use client";

import type { Role } from "@prisma/client";
import { LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { church } from "@/config/church";
import { features } from "@/config/features";
import { type AdminNavItem, visibleAdminNav } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth/sign-out";

type ShellUser = {
  email: string | null;
  role: Role;
};

type Props = {
  children: React.ReactNode;
  user: ShellUser;
};

export function AdminShell({ children, user }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () =>
      visibleAdminNav(user.role).filter(
        (item) => !item.feature || features[item.feature],
      ),
    [user.role],
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
        <SidebarHeader />
        <SidebarNav navItems={navItems} />
        <SidebarFooter />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b p-6">
                <SheetTitle>{church.name}</SheetTitle>
              </SheetHeader>
              <SidebarNav
                navItems={navItems}
                onNavigate={() => setMobileOpen(false)}
              />
              <SidebarFooter />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <Badge variant="secondary">{user.role}</Badge>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(user.email ?? user.role).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarHeader() {
  return (
    <div className="border-b p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {church.shortName}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-tight">
        {church.name}
      </p>
    </div>
  );
}

function SidebarNav({
  navItems,
  onNavigate,
}: {
  navItems: readonly AdminNavItem[];
  onNavigate?: () => void;
}) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.comingSoon) {
          return (
            <div
              key={item.href}
              aria-disabled
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{t(item.labelKey)}</span>
              <Badge variant="outline" className="text-[10px]">
                {tCommon("soon")}
              </Badge>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const t = useTranslations("common");
  return (
    <form action={signOutAction} className="border-t p-3">
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        {t("signOut")}
      </Button>
    </form>
  );
}
