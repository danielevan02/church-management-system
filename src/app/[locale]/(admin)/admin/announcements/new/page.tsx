
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";

import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";
import { createAnnouncementAction } from "@/server/actions/announcements/create";

export default async function NewAnnouncementPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("announcements.new");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/announcements"
        backLabel={t("backToList")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <AnnouncementForm
        submitLabel={t("submit")}
        onSubmit={createAnnouncementAction}
      />
    </div>
  );
}
