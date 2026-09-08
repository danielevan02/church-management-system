import { EyeOff, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { DeletePrayerButton } from "@/components/admin/prayer-requests/delete-prayer-button";
import { PrayerStatusSelect } from "@/components/admin/prayer-requests/status-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { getPrayerRequest } from "@/server/queries/prayer-requests";
import { formatJakarta } from "@/lib/datetime";

export default async function PrayerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const { id } = await params;
  const item = await getPrayerRequest(id);
  if (!item) notFound();

  const t = await getTranslations("prayerRequests");

  const canDelete = hasAtLeastRole(session.user.role, "ADMIN");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/prayer-requests"
        backLabel={t("detail.back")}
        title={item.title || t("list.untitled")}
      />

      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BlockSection
          title={t("detail.body")}
          className="lg:col-span-2"
        >
          <p className="whitespace-pre-wrap text-sm">{item.body}</p>
        </BlockSection>

        <BlockSection
          title={t("detail.meta")}
          bodyClassName="flex flex-col gap-3 text-sm"
        >
          <Field label={t("detail.submittedBy")}>
            {item.isAnonymous ? (
              <span className="italic text-on-surface-variant">
                {t("list.anonymous")}
              </span>
            ) : item.member ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  {item.member.photoUrl ? (
                    <AvatarImage
                      src={item.member.photoUrl}
                      alt={item.member.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {item.member.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/admin/members/${item.member.id}`}
                  className="font-medium hover:underline"
                >
                  {item.member.fullName}
                </Link>
              </div>
            ) : (
              <span className="italic text-on-surface-variant">
                {item.submittedBy ?? "—"}
              </span>
            )}
          </Field>
          <Field label={t("detail.createdAt")}>
            <span className="tabular-nums">
              {formatJakarta(item.createdAt, "dd MMM yyyy, HH:mm")}
            </span>
          </Field>
          <Field label={t("detail.status")}>
            <PrayerStatusSelect id={item.id} value={item.status} />
          </Field>
          <Field label={t("detail.visibility")}>
            <div className="flex flex-wrap gap-1">
              {item.isAnonymous ? (
                <Badge variant="outline">
                  <EyeOff className="h-3 w-3" />
                  {t("list.anon")}
                </Badge>
              ) : null}
              {item.isPublic ? (
                <Badge variant="outline">
                  <Globe className="h-3 w-3" />
                  {t("list.public")}
                </Badge>
              ) : null}
              {!item.isAnonymous && !item.isPublic ? (
                <span className="text-xs text-on-surface-variant">
                  {t("detail.privateOnly")}
                </span>
              ) : null}
            </div>
          </Field>
        </BlockSection>
      </div>

      {canDelete ? (
        <div className="flex justify-end">
          <DeletePrayerButton id={item.id} variant="destructive" />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="col-span-2">{children}</dd>
    </div>
  );
}
