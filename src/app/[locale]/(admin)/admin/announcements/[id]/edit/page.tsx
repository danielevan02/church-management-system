
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";
import { DeleteAnnouncementButton } from "./delete-announcement-button";

import { auth } from "@/lib/auth";
import { toJakartaInput } from "@/lib/datetime";

import { hasAtLeastRole } from "@/lib/permissions";
import { updateAnnouncementAction } from "@/server/actions/announcements/update";
import { getAnnouncement } from "@/server/queries/announcements";

import type { AnnouncementInput } from "@/lib/validation/announcement";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  const t = await getTranslations("announcements.edit");

  async function update(input: AnnouncementInput) {
    "use server";
    return updateAnnouncementAction(id, input);
  }

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/announcements"
        backLabel={t("backToList")}
        title={announcement.title}
        action={
          <DeleteAnnouncementButton id={id} />
        }
      />

      <AnnouncementForm
        submitLabel={t("submit")}
        onSubmit={update}
        initialValues={{
          title: announcement.title,
          body: announcement.body,
          publishedAt: toJakartaInput(announcement.publishedAt),
        }}
      />
    </div>
  );
}
