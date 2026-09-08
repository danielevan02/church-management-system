
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { DevotionalForm } from "@/components/admin/devotionals/devotional-form";

import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";
import { createDevotionalAction } from "@/server/actions/devotionals/create";

export default async function NewDevotionalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("devotionals.new");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/devotionals"
        backLabel={t("backToList")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <DevotionalForm
        submitLabel={t("submit")}
        onSubmit={createDevotionalAction}
      />
    </div>
  );
}
