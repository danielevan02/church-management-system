import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { PrayerCreateForm } from "./prayer-create-form";
import { PageHeader } from "@/components/m3/page-header";
import { auth } from "@/lib/auth";

export default async function NewMyPrayerRequestPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!session.user.memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.prayerRequests");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        backHref="/me/prayer-requests"
        backLabel={t("back")}
        eyebrow={t("eyebrow")}
        title={t("newTitle")}
        subtitle={t("newSubtitle")}
      />
      <PrayerCreateForm submitLabel={t("submit")} />
    </div>
  );
}
