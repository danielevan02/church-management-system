"use client";

import { LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { type MemberNavItem, memberNav } from "@/config/nav";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth/sign-out";

type ShellMember = {
  firstName: string;
  fullName: string;
  photoUrl: string | null;
};

type Props = {
  children: React.ReactNode;
  member: ShellMember | null;
};

export function MemberShell({ children, member }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => memberNav.filter((item) => !item.feature || features[item.feature]),
    [],
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b p-6 text-left">
              <SheetTitle>{church.name}</SheetTitle>
            </SheetHeader>
            <MemberNav
              navItems={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
            <SignOutFooter />
          </SheetContent>
        </Sheet>

        <Link href="/me/dashboard" className="font-semibold">
          {church.shortName}
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <DesktopNav navItems={navItems} />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {member?.photoUrl ? (
              <AvatarImage src={member.photoUrl} alt={member.fullName} />
            ) : null}
            <AvatarFallback>
              {(member?.firstName ?? "J").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <form action={signOutAction} className="hidden md:block">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">
                <SignOutLabel />
              </span>
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

function DesktopNav({ navItems }: { navItems: readonly MemberNavItem[] }) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.comingSoon) {
          return (
            <span
              key={item.href}
              aria-disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
              <Badge variant="outline" className="ml-1 text-[10px]">
                {tCommon("soon")}
              </Badge>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </>
  );
}

function MemberNav({
  navItems,
  onNavigate,
}: {
  navItems: readonly MemberNavItem[];
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

function SignOutFooter() {
  const tCommon = useTranslations("common");
  return (
    <form action={signOutAction} className="border-t p-3">
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        {tCommon("signOut")}
      </Button>
    </form>
  );
}

function SignOutLabel() {
  const tCommon = useTranslations("common");
  return tCommon("signOut");
}
