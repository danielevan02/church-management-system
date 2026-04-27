import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <AdminShell
      user={{
        email: session.user.email ?? null,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
