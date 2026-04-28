import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarAutoCloseMobile } from "@/components/shared/sidebar-autoclose-mobile";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAdminSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar
        variant="inset"
        user={{ email: session.user.email ?? null, role: session.user.role }}
      />
      <SidebarInset className="min-w-0">
        <AdminHeader />
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
      <SidebarAutoCloseMobile />
    </SidebarProvider>
  );
}
