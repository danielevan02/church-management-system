import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PrayerEditForm } from "./prayer-edit-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/me/prayer-requests">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("editTitle")}</h1>
      </header>
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
