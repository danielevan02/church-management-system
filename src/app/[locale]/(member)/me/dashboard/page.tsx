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
import { prisma } from "@/lib/prisma";

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const member = session.user.memberId
    ? await prisma.member.findUnique({
        where: { id: session.user.memberId },
        select: { firstName: true, fullName: true, phone: true },
      })
    : null;

  const t = await getTranslations("dashboard.member");

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit">
            {session.user.role}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("welcome", { name: member?.firstName ?? "Jemaat" })}
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 placeholder</CardTitle>
            <CardDescription>
              QR pribadi, history persembahan, info komsel akan muncul di phase
              berikutnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>Phone: {member?.phone ?? "—"}</span>
            <span>Linked memberId: {session.user.memberId ?? "—"}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
