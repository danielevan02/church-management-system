"use client";

import { Home, Mail, Settings, Users } from "lucide-react";

import { NavigationBar, NavigationRail } from "@/components/m3/navigation";
import type { NavDestination } from "@/components/m3/navigation";

/**
 * Client island for the gallery's navigation preview.
 *
 * `NavDestination.icon` is a component reference, and a function cannot cross
 * the RSC boundary — so the destinations array has to be built on the client
 * side of the boundary, not passed in from a Server Component. In the real app
 * this is a non-issue: navigation needs `usePathname` to resolve its active
 * item, so it is always a client component already.
 */
const DESTINATIONS: NavDestination[] = [
  { href: "/m3", label: "Home", icon: Home, exact: true },
  { href: "/m3/people", label: "People", icon: Users, badge: 3 },
  { href: "/m3/inbox", label: "Inbox", icon: Mail, badge: true },
  { href: "/m3/settings", label: "Settings", icon: Settings },
];

export function NavRailPreview() {
  return (
    <div className="flex gap-4 overflow-hidden rounded-lg border border-outline-variant">
      <NavigationRail destinations={DESTINATIONS} ariaLabel="Rail preview" />
      <NavigationRail
        destinations={DESTINATIONS}
        variant="drawer"
        ariaLabel="Drawer preview"
      />
    </div>
  );
}

export function NavBarPreview() {
  return <NavigationBar destinations={DESTINATIONS} ariaLabel="Bar preview" />;
}
