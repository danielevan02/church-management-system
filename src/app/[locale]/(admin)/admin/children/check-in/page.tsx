import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { CheckInForm } from "@/components/admin/children/check-in-form";
import { CheckOutForm } from "@/components/admin/children/check-out-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import {
  listActiveCheckIns,
  listAllChildClasses,
} from "@/server/queries/children";

export default async function CheckInDashboardPage() {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("children.checkIn");

  const [active, classes] = await Promise.all([
    listActiveCheckIns(),
    listAllChildClasses({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/children">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Check-in form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("formTitle")}</CardTitle>
            <CardDescription>{t("formDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("noClasses")}
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/children/classes/new">
                      {t("createClassCta")}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <CheckInForm classes={classes} />
            )}
          </CardContent>
        </Card>

        {/* Check-out form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("checkOutTitle")}</CardTitle>
            <CardDescription>{t("checkOutDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckOutForm />
          </CardContent>
        </Card>
      </div>

      {/* Active check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("activeTitle", { count: active.length })}
          </CardTitle>
          <CardDescription>{t("activeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("activeEmpty")}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {active.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {row.child.photoUrl ? (
                        <AvatarImage
                          src={row.child.photoUrl}
                          alt={row.child.fullName}
                        />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {row.child.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {row.child.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.childClass.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-sm bg-muted/40 px-2 py-1.5">
                    <span className="text-xs text-muted-foreground">
                      {t("activeCard.code")}
                    </span>
                    <code className="font-mono text-base font-bold tracking-widest tabular-nums">
                      {row.securityCode}
                    </code>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("activeCard.guardian")}: {row.guardian.fullName}
                    {row.guardian.phone ? ` · ${row.guardian.phone}` : ""}
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">
                    {t("activeCard.checkedInAt")}:{" "}
                    {format(row.checkedInAt, "HH:mm")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
