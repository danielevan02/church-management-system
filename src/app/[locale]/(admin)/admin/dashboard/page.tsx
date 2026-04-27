import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role === "MEMBER") redirect("/me/dashboard");

  const t = await getTranslations("dashboard.admin");

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit">
            {session.user.role}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("welcome", { name: session.user.email ?? "Admin" })}
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 placeholder</CardTitle>
            <CardDescription>
              Modul fungsional muncul di phase berikutnya. Saat ini halaman ini
              hanya memverifikasi auth + RBAC bekerja.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>Session user id: {session.user.id}</span>
            <span>Linked memberId: {session.user.memberId ?? "—"}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
