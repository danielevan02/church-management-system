import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("dashboard.admin");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcome", { name: session?.user.email ?? "Admin" })}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 placeholder</CardTitle>
          <CardDescription>
            Modul Member & Household sudah hidup. KPI/widget lain (kehadiran,
            persembahan, komsel) menyusul di phase masing-masing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>Session user id: {session?.user.id}</span>
          <span>Linked memberId: {session?.user.memberId ?? "—"}</span>
        </CardContent>
      </Card>
    </div>
  );
}
