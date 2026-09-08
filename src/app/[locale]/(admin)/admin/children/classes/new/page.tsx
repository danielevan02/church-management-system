
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { ClassCreateForm } from "./class-create-form";

import { features } from "@/config/features";
import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";

export default async function NewChildClassPage() {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("children.classes");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/children/classes"
        backLabel={t("back")}
        title={t("newTitle")}
      />
      <ClassCreateForm submitLabel={t("submitCreate")} />
    </div>
  );
}
