"use client";

import {
  BookOpen,
  HandCoins,
  Home,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { BottomNavScanButton } from "@/components/member/bottom-nav-scan-button";
import { features } from "@/config/features";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  feature?: keyof typeof features;
};

const ITEMS: readonly NavItem[] = [
  {
    href: "/me/dashboard",
    labelKey: "home",
    icon: Home,
  },
  {
    href: "/me/devotionals",
    labelKey: "devotion",
    icon: BookOpen,
    feature: "devotionals",
  },
  // Center scan slot is rendered separately — not a normal nav link.
  {
    href: "/me/giving",
    labelKey: "giving",
    icon: HandCoins,
    feature: "giving",
  },
  {
    href: "/me/profile",
    labelKey: "profile",
    icon: UserCircle,
  },
];

const SCAN_FEATURE: keyof typeof features = "selfCheckIn";

export function MobileBottomNav({ memberId }: { memberId: string | null }) {
  const t = useTranslations("mobileNav");
  const pathname = usePathname();
  const items = ITEMS.filter((it) => !it.feature || features[it.feature]);
  const showScan = features[SCAN_FEATURE] && memberId !== null;
  const scanInsertAt = Math.floor(items.length / 2);

  function isActive(href: string) {
    if (pathname === href) return true;
    if (href === "/me/dashboard") return pathname === "/me/dashboard";
    return pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      aria-label={t("ariaLabel")}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 flex justify-center md:hidden",
      )}
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <ul
        className={cn(
          "pointer-events-auto flex w-[90%] items-center justify-around rounded-full border border-white/30 bg-background/40 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md backdrop-saturate-200",
          "dark:border-white/10 dark:bg-background/30 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        )}
      >
        {items.map((item, idx) => {
          const renderScan = showScan && idx === scanInsertAt;
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Fragment key={item.href}>
              {renderScan ? (
                <li className="flex justify-center">
                  <BottomNavScanButton
                    memberId={memberId!}
                    ariaLabel={t("scan")}
                  />
                </li>
              ) : null}
              <li className="flex justify-center">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground/70 hover:text-foreground",
                  )}
                >
                  <Icon
                    className="size-[22px]"
                    strokeWidth={active ? 2 : 1.75}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-[10px] tracking-tight transition-all",
                      active ? "font-semibold" : "font-medium",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
