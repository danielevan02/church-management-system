import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BarChart3,
  BookOpen,
  Calendar,
  HandCoins,
  HandHeart,
  HeartHandshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  Megaphone,
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

export type AdminNavGroup =
  | "overview"
  | "people"
  | "ministry"
  | "communication"
  | "finance"
  | "system";

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
  // === OVERVIEW ===
  {
    href: "/admin/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    group: "overview",
    roles: ["ADMIN", "STAFF", "LEADER"],
  },

  // === PEOPLE & COMMUNITY ===
  {
    href: "/admin/members",
    labelKey: "nav.members",
    icon: Users,
    group: "people",
    roles: ["ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/households",
    labelKey: "nav.households",
    icon: Home,
    group: "people",
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/cell-groups",
    labelKey: "nav.cellGroups",
    icon: UsersRound,
    group: "people",
    roles: ["ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/pastoral",
    labelKey: "nav.pastoral",
    icon: HeartHandshake,
    group: "people",
    roles: ["ADMIN", "STAFF", "LEADER"],
    feature: "pastoralCare",
  },

  // === MINISTRY & WORSHIP ===
  {
    href: "/admin/attendance",
    labelKey: "nav.attendance",
    icon: UserCheck,
    group: "ministry",
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/events",
    labelKey: "nav.events",
    icon: Calendar,
    group: "ministry",
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/volunteers",
    labelKey: "nav.volunteers",
    icon: HeartHandshake,
    group: "ministry",
    roles: ["ADMIN", "STAFF", "LEADER"],
    feature: "volunteers",
  },
  {
    href: "/admin/children",
    labelKey: "nav.children",
    icon: Baby,
    group: "ministry",
    roles: ["ADMIN", "STAFF"],
    feature: "childrensCheckIn",
  },
  {
    href: "/admin/discipleship",
    labelKey: "nav.discipleship",
    icon: Sprout,
    group: "ministry",
    roles: ["ADMIN", "STAFF"],
    feature: "discipleship",
  },

  // === COMMUNICATION & CONTENT ===
  {
    href: "/admin/announcements",
    labelKey: "nav.announcements",
    icon: Megaphone,
    group: "communication",
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/devotionals",
    labelKey: "nav.devotionals",
    icon: BookOpen,
    group: "communication",
    roles: ["ADMIN", "STAFF"],
    feature: "devotionals",
  },
  {
    href: "/admin/prayer-requests",
    labelKey: "nav.prayerRequestsAdmin",
    icon: HandHeart,
    group: "communication",
    roles: ["ADMIN", "STAFF"],
  },

  // === FINANCE & REPORTS ===
  {
    href: "/admin/giving",
    labelKey: "nav.giving",
    icon: HandCoins,
    group: "finance",
    roles: ["ADMIN", "STAFF"],
    feature: "giving",
  },
  {
    href: "/admin/reports",
    labelKey: "nav.reports",
    icon: BarChart3,
    group: "finance",
    roles: ["ADMIN", "STAFF"],
  },

  // === SYSTEM (SECONDARY) ===
  {
    href: "/admin/settings",
    labelKey: "nav.settings",
    icon: Settings,
    group: "system",
    roles: ["ADMIN"],
  },
  {
    href: "/admin/help",
    labelKey: "nav.help",
    icon: HelpCircle,
    group: "system",
    roles: ["ADMIN", "STAFF", "LEADER"],
  },
  {
    href: "/admin/search",
    labelKey: "nav.search",
    icon: Search,
    group: "system",
    roles: ["ADMIN", "STAFF", "LEADER"],
  },
] as const;

export function visibleAdminNav(role: Role): readonly AdminNavItem[] {
  return adminNav.filter((item) => item.roles.includes(role));
}

export type MemberNavGroup = "main" | "worship" | "community";

export type MemberNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  group: MemberNavGroup;
  feature?: FeatureFlag;
  comingSoon?: boolean;
};

export const memberNav: readonly MemberNavItem[] = [
  // === MAIN ===
  {
    href: "/me/dashboard",
    labelKey: "nav.myDashboard",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    href: "/me/profile",
    labelKey: "nav.myProfile",
    icon: UserCircle,
    group: "main",
  },
  {
    href: "/me/qr",
    labelKey: "nav.myQr",
    icon: QrCode,
    group: "main",
  },

  // === WORSHIP & SERVING ===
  {
    href: "/me/check-in",
    labelKey: "nav.myCheckIn",
    icon: UserCheck,
    group: "worship",
    feature: "selfCheckIn",
  },
  {
    href: "/me/events",
    labelKey: "nav.myEvents",
    icon: Calendar,
    group: "worship",
  },
  {
    href: "/me/volunteer",
    labelKey: "nav.myVolunteer",
    icon: HeartHandshake,
    group: "worship",
    feature: "volunteers",
  },
  {
    href: "/me/children",
    labelKey: "nav.myChildren",
    icon: Baby,
    group: "worship",
    feature: "childrensCheckIn",
  },
  {
    href: "/me/giving",
    labelKey: "nav.myGiving",
    icon: HandCoins,
    group: "worship",
    feature: "giving",
  },

  // === COMMUNITY & SPIRITUAL ===
  {
    href: "/me/cell-group",
    labelKey: "nav.myCellGroup",
    icon: UsersRound,
    group: "community",
  },
  {
    href: "/me/devotionals",
    labelKey: "nav.myDevotionals",
    icon: BookOpen,
    group: "community",
    feature: "devotionals",
  },
  {
    href: "/me/prayer-requests",
    labelKey: "nav.prayerRequests",
    icon: HandHeart,
    group: "community",
  },
  {
    href: "/me/discipleship",
    labelKey: "nav.myDiscipleship",
    icon: Sprout,
    group: "community",
    feature: "discipleship",
  },
  {
    href: "/me/announcements",
    labelKey: "nav.myAnnouncements",
    icon: Megaphone,
    group: "community",
  },
] as const;
