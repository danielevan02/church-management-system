
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { UserCreateForm } from "@/components/admin/settings/user-create-form";

import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const t = await getTranslations("settings.users");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/settings/users"
        backLabel={t("back")}
        title={t("newTitle")}
        subtitle={t("newSubtitle")}
      />
      <UserCreateForm submitLabel={t("submitCreate")} />
    </div>
  );
}
