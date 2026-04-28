"use client";

import { useEffect, useRef } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "@/lib/i18n/navigation";

/**
 * Closes the mobile sidebar (Sheet) whenever the pathname changes. Mount
 * inside SidebarProvider so it can read sidebar state.
 */
export function SidebarAutoCloseMobile() {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return null;
}
