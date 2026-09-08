
import { getTranslations } from "next-intl/server";
import { Baby } from "lucide-react";
import { BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { CheckInForm } from "@/components/admin/children/check-in-form";
import { CheckOutForm } from "@/components/admin/children/check-out-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { formatJakarta } from "@/lib/datetime";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/children"
        backLabel={t("back")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Check-in form */}
        <BlockSection
          title={t("formTitle")}
          description={t("formDescription")}
        >
          {classes.length === 0 ? (
            <EmptyState
              icon={Baby}
              tone="quiet"
              title={t("noClasses")}
              action={
                <Button asChild size="sm" variant="tonal">
                  <Link href="/admin/children/classes/new">
                    {t("createClassCta")}
                  </Link>
                </Button>
              }
            />
          ) : (
            <CheckInForm classes={classes} />
          )}
        </BlockSection>

        {/* Check-out form */}
        <BlockSection
          title={t("checkOutTitle")}
          description={t("checkOutDescription")}
        >
          <CheckOutForm />
        </BlockSection>
      </div>

      {/* Active check-ins */}
      <BlockSection
        title={t("activeTitle", { count: active.length })}
        description={t("activeDescription")}
      >
        {active.length === 0 ? (
          <EmptyState icon={Baby} title={t("activeEmpty")} />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {active.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 rounded-2xl p-3 bg-surface-container-high"
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
                    <span className="text-xs text-on-surface-variant">
                      {row.childClass.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-sm bg-surface-container-high/40 px-2 py-1.5">
                  <span className="text-xs text-on-surface-variant">
                    {t("activeCard.code")}
                  </span>
                  <code className="font-mono text-base font-bold tracking-widest tabular-nums">
                    {row.securityCode}
                  </code>
                </div>
                <div className="text-xs text-on-surface-variant">
                  {t("activeCard.guardian")}: {row.guardian.fullName}
                  {row.guardian.phone ? ` · ${row.guardian.phone}` : ""}
                </div>
                <div className="text-xs tabular-nums text-on-surface-variant">
                  {t("activeCard.checkedInAt")}:{" "}
                  {formatJakarta(row.checkedInAt, "HH:mm")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </BlockSection>
    </div>
  );
}
