import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";
import { DeleteAnnouncementButton } from "./delete-announcement-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toJakartaInput } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/announcements">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {announcement.title}
          </h1>
        </div>
        <DeleteAnnouncementButton id={id} />
      </header>

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
