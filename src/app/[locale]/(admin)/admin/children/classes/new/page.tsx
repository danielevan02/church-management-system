import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { ClassCreateForm } from "./class-create-form";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";

export default async function NewChildClassPage() {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("children.classes");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/children/classes">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("newTitle")}</h1>
      </header>
      <ClassCreateForm submitLabel={t("submitCreate")} />
    </div>
  );
}
