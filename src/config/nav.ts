import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  HandCoins,
  Heart,
  HeartHandshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Search,
  Settings,
  Sprout,
  UserCheck,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";

import type { FeatureFlag } from "@/config/features";

export type AdminNavGroup = "main" | "documents" | "secondary";

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  group: AdminNavGroup;
  roles: readonly Role[];
  feature?: FeatureFlag;
  /** Set to true while the destination route hasn't been built yet. */
  comingSoon?: boolean;
};

export const adminNav: readonly AdminNavItem[] = [
  // === MAIN ===
  {
    href: "/admin/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/members",
    labelKey: "nav.members",
    icon: Users,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/households",
    labelKey: "nav.households",
    icon: Home,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },
  {
    href: "/admin/cell-groups",
    labelKey: "nav.cellGroups",
    icon: UsersRound,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/attendance",
    labelKey: "nav.attendance",
    icon: UserCheck,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },
  {
    href: "/admin/giving",
    labelKey: "nav.giving",
    icon: HandCoins,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "giving",
  },
  {
    href: "/admin/events",
    labelKey: "nav.events",
    icon: Calendar,
    group: "main",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },

  // === DOCUMENTS / MODUL ===
  {
    href: "/admin/communications",
    labelKey: "nav.communications",
    icon: MessageSquare,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "whatsappBroadcast",
  },
  {
    href: "/admin/volunteers",
    labelKey: "nav.volunteers",
    icon: HeartHandshake,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
    feature: "volunteers",
  },
  {
    href: "/admin/children",
    labelKey: "nav.children",
    icon: Heart,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "childrensCheckIn",
  },
  {
    href: "/admin/pastoral",
    labelKey: "nav.pastoral",
    icon: HeartHandshake,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
    feature: "pastoralCare",
  },
  {
    href: "/admin/prayer-requests",
    labelKey: "nav.prayerRequestsAdmin",
    icon: Heart,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },
  {
    href: "/admin/discipleship",
    labelKey: "nav.discipleship",
    icon: Sprout,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    feature: "discipleship",
  },
  {
    href: "/admin/reports",
    labelKey: "nav.reports",
    icon: BarChart3,
    group: "documents",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },

  // === SECONDARY ===
  {
    href: "/admin/settings",
    labelKey: "nav.settings",
    icon: Settings,
    group: "secondary",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/admin/help",
    labelKey: "nav.help",
    icon: HelpCircle,
    group: "secondary",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/search",
    labelKey: "nav.search",
    icon: Search,
    group: "secondary",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER"],
  },
] as const;

export function visibleAdminNav(role: Role): readonly AdminNavItem[] {
  return adminNav.filter((item) => item.roles.includes(role));
}

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
    href: "/me/check-in",
    labelKey: "nav.myCheckIn",
    icon: UserCheck,
    feature: "selfCheckIn",
  },
  {
    href: "/me/cell-group",
    labelKey: "nav.myCellGroup",
    icon: UsersRound,
  },
  {
    href: "/me/giving",
    labelKey: "nav.myGiving",
    icon: HandCoins,
    feature: "giving",
  },
  {
    href: "/me/events",
    labelKey: "nav.myEvents",
    icon: Calendar,
  },
  {
    href: "/me/volunteer",
    labelKey: "nav.myVolunteer",
    icon: HeartHandshake,
    feature: "volunteers",
  },
  {
    href: "/me/discipleship",
    labelKey: "nav.myDiscipleship",
    icon: Sprout,
    feature: "discipleship",
  },
  {
    href: "/me/prayer-requests",
    labelKey: "nav.prayerRequests",
    icon: Heart,
  },
  {
    href: "/me/children",
    labelKey: "nav.myChildren",
    icon: Heart,
    feature: "childrensCheckIn",
  },
] as const;
