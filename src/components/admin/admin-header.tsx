"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 bg-surface transition-colors duration-200 ease-standard group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-t-lg">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
      </div>
    </header>
  );
}

