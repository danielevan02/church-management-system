import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PrayerEditForm } from "./prayer-edit-form";
import { PageHeader } from "@/components/m3/page-header";
import { auth } from "@/lib/auth";
import { getPrayerRequest } from "@/server/queries/prayer-requests";

export default async function EditMyPrayerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const { id } = await params;
  const item = await getPrayerRequest(id);
  if (!item) notFound();
  if (item.memberId !== memberId) notFound();
  if (item.status !== "OPEN") notFound();

  const t = await getTranslations("memberPortal.prayerRequests");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        backHref="/me/prayer-requests"
        backLabel={t("back")}
        eyebrow={t("eyebrow")}
        title={t("editTitle")}
      />
      <PrayerEditForm
        id={id}
        submitLabel={t("editSubmit")}
        initialValues={{
          title: item.title ?? "",
          body: item.body,
          isAnonymous: item.isAnonymous,
          isPublic: item.isPublic,
        }}
      />
    </div>
  );
}
