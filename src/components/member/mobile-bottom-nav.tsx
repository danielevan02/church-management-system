"use client";

import {
  BookOpen,
  HandCoins,
  Home,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { BottomNavScanButton } from "@/components/member/bottom-nav-scan-button";
import { NavigationBar, type NavDestination } from "@/components/m3/navigation";
import { features } from "@/config/features";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  feature?: keyof typeof features;
  exact?: boolean;
};

const ITEMS: readonly NavItem[] = [
  { href: "/me/dashboard", labelKey: "home", icon: Home, exact: true },
  {
    href: "/me/devotionals",
    labelKey: "devotion",
    icon: BookOpen,
    feature: "devotionals",
  },
  { href: "/me/giving", labelKey: "giving", icon: HandCoins, feature: "giving" },
  { href: "/me/profile", labelKey: "profile", icon: UserCircle },
];

const SCAN_FEATURE: keyof typeof features = "selfCheckIn";

/**
 * Member portal bottom navigation.
 *
 * Now an M3 navigation bar: 80dp, `surface-container`, with selection shown as
 * a 64x32 `secondary-container` pill behind the icon. The previous version was
 * a floating glassmorphic pill whose active state was colour-only — a
 * different design language that no amount of token swapping would convert.
 *
 * The scan action also moved. It used to be a circular button wedged into the
 * middle of the bar, splitting the destinations 2-and-2. That centre-button
 * pattern is a Material 2 / iOS tab-bar idiom; M3 puts a FAB *above* the
 * navigation bar at the trailing edge. Which is also the better target: it is
 * 56dp instead of 48dp, it no longer competes with the destinations for
 * meaning, and the four nav items keep an even rhythm.
 */
export function MobileBottomNav({ memberId }: { memberId: string | null }) {
  const t = useTranslations("mobileNav");

  const destinations: NavDestination[] = ITEMS.filter(
    (item) => !item.feature || features[item.feature],
  ).map((item) => ({
    href: item.href,
    label: t(item.labelKey),
    icon: item.icon,
    exact: item.exact,
  }));

  const showScan = features[SCAN_FEATURE] && memberId !== null;

  return (
    <>
      {showScan ? (
        <div
          className="pointer-events-none fixed right-4 z-40 md:hidden"
          style={{
            bottom: "calc(6rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="pointer-events-auto">
            <BottomNavScanButton memberId={memberId!} ariaLabel={t("scan")} />
          </div>
        </div>
      ) : null}
      <NavigationBar destinations={destinations} ariaLabel={t("ariaLabel")} />
    </>
  );
}
