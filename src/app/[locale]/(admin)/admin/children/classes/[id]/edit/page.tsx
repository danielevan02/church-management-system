
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { ClassEditForm } from "./class-edit-form";

import { features } from "@/config/features";
import { auth } from "@/lib/auth";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/children/classes"
        backLabel={t("back")}
        title={t("editTitle")}
      />
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
