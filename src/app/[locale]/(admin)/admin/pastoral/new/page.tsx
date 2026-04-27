import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { VisitCreateForm } from "./visit-create-form";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function NewPastoralVisitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!features.pastoralCare) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "LEADER")) notFound();

  const sp = await searchParams;
  const memberParam = Array.isArray(sp.member) ? sp.member[0] : sp.member;

  let initialMemberName: string | null = null;
  if (memberParam) {
    const m = await prisma.member.findUnique({
      where: { id: memberParam },
      select: { fullName: true },
    });
    initialMemberName = m?.fullName ?? null;
  }

  const t = await getTranslations("pastoral.new");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <VisitCreateForm
        submitLabel={t("submit")}
        initialMemberId={memberParam ?? undefined}
        initialMemberName={initialMemberName}
      />
    </div>
  );
}
