import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { ClassEditForm } from "./class-edit-form";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { getChildClass } from "@/server/queries/children";

export default async function EditChildClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const { id } = await params;
  const cls = await getChildClass(id);
  if (!cls) notFound();

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
        <h1 className="text-3xl font-bold tracking-tight">{t("editTitle")}</h1>
      </header>
      <ClassEditForm
        id={id}
        submitLabel={t("submitUpdate")}
        initialValues={{
          name: cls.name,
          ageMin: cls.ageMin,
          ageMax: cls.ageMax,
          isActive: cls.isActive,
        }}
      />
    </div>
  );
}
