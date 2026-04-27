import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  HandCoins,
  Heart,
  HeartHandshake,
  Home,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  Sprout,
  UserCheck,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";

import type { FeatureFlag } from "@/config/features";

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles: readonly Role[];
  feature?: FeatureFlag;
  /** Set to true while the destination route hasn't been built yet. */
  comingSoon?: boolean;
};

export type MemberNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  feature?: FeatureFlag;
  comingSoon?: boolean;
};

export const memberNav: readonly MemberNavItem[] = [
  {
    href: "/me/dashboard",
    labelKey: "nav.myDashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/me/profile",
    labelKey: "nav.myProfile",
    icon: UserCircle,
  },
  {
    href: "/me/qr",
    labelKey: "nav.myQr",
    icon: QrCode,
  },
  {
    href: "/me/cell-group",
    labelKey: "nav.myCellGroup",
    icon: UsersRound,
    comingSoon: true,
  },
  {
    href: "/me/giving",
    labelKey: "nav.myGiving",
    icon: HandCoins,
    feature: "giving",
    comingSoon: true,
  },
  {
    href: "/me/events",
    labelKey: "nav.myEvents",
    icon: Calendar,
    comingSoon: true,
  },
  {
    href: "/me/prayer-requests",
    labelKey: "nav.prayerRequests",
    icon: Heart,
    comingSoon: true,
  },
] as const;

export const adminNav: readonly AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/members",
    labelKey: "nav.members",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/households",
    labelKey: "nav.households",
    icon: Home,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },
  {
    href: "/admin/cell-groups",
    labelKey: "nav.cellGroups",
    icon: UsersRound,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
    comingSoon: true,
  },
  {
    href: "/admin/attendance",
    labelKey: "nav.attendance",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    comingSoon: true,
  },
  {
    href: "/admin/giving",
    labelKey: "nav.giving",
    icon: HandCoins,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "giving",
    comingSoon: true,
  },
  {
    href: "/admin/events",
    labelKey: "nav.events",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    comingSoon: true,
  },
  {
    href: "/admin/communications",
    labelKey: "nav.communications",
    icon: MessageSquare,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "whatsappBroadcast",
    comingSoon: true,
  },
  {
    href: "/admin/volunteers",
    labelKey: "nav.volunteers",
    icon: HeartHandshake,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "volunteers",
    comingSoon: true,
  },
  {
    href: "/admin/children",
    labelKey: "nav.children",
    icon: Heart,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "childrensCheckIn",
    comingSoon: true,
  },
  {
    href: "/admin/pastoral",
    labelKey: "nav.pastoral",
    icon: HeartHandshake,
    roles: ["SUPER_ADMIN", "ADMIN"],
    feature: "pastoralCare",
    comingSoon: true,
  },
  {
    href: "/admin/discipleship",
    labelKey: "nav.discipleship",
    icon: Sprout,
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "discipleship",
    comingSoon: true,
  },
  {
    href: "/admin/reports",
    labelKey: "nav.reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "ADMIN"],
    comingSoon: true,
  },
  {
    href: "/admin/settings",
    labelKey: "nav.settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
    comingSoon: true,
  },
] as const;

export function visibleAdminNav(role: Role): readonly AdminNavItem[] {
  return adminNav.filter((item) => item.roles.includes(role));
}
