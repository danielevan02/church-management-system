import { format } from "date-fns";
import { ArrowLeft, EyeOff, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { DeletePrayerButton } from "@/components/admin/prayer-requests/delete-prayer-button";
import { PrayerStatusSelect } from "@/components/admin/prayer-requests/status-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { getPrayerRequest } from "@/server/queries/prayer-requests";

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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/prayer-requests">
            <ArrowLeft className="h-4 w-4" />
            {t("detail.back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {item.title || t("list.untitled")}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("detail.body")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{item.body}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.meta")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Field label={t("detail.submittedBy")}>
              {item.isAnonymous ? (
                <span className="italic text-muted-foreground">
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
                <span className="italic text-muted-foreground">
                  {item.submittedBy ?? "—"}
                </span>
              )}
            </Field>
            <Field label={t("detail.createdAt")}>
              <span className="tabular-nums">
                {format(item.createdAt, "dd MMM yyyy, HH:mm")}
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
                  <span className="text-xs text-muted-foreground">
                    {t("detail.privateOnly")}
                  </span>
                ) : null}
              </div>
            </Field>
          </CardContent>
        </Card>
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
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{children}</dd>
    </div>
  );
}
