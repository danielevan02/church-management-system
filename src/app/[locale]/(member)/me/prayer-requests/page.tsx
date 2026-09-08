import { format } from "date-fns";
import { Heart, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/m3/empty-state";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { CancelMyPrayerButton } from "@/components/member/prayer-requests/cancel-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { listPrayerRequestsForMember } from "@/server/queries/prayer-requests";

export default async function MyPrayerRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.prayerRequests");
  const tStatus = await getTranslations("prayerRequests.status");

  const items = await listPrayerRequestsForMember(memberId);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button asChild className="rounded-full">
            <Link href="/me/prayer-requests/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("newButton")}</span>
            </Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("empty")}
          action={
            <Button asChild variant="tonal" size="sm" className="rounded-full px-5">
              <Link href="/me/prayer-requests/new">{t("emptyCta")}</Link>
            </Button>
          }
        />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="flex flex-col gap-3">
          {items.map((p) => (
            <ExpressiveCard key={p.id} className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="min-w-0 text-base font-bold text-on-surface">
                  {p.title || t("untitled")}
                </h2>
                <Badge
                  variant={p.status === "ANSWERED" ? "default" : "outline"}
                  className="shrink-0"
                >
                  {tStatus(p.status.toLowerCase() as never)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span className="tabular-nums">
                  {format(p.createdAt, "dd MMM yyyy")}
                </span>
                {p.isAnonymous ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("anonymous")}
                  </Badge>
                ) : null}
                {p.isPublic ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("public")}
                  </Badge>
                ) : null}
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap text-on-surface-variant">
                {p.body}
              </p>

              {p.status === "OPEN" ? (
                <div className="flex justify-end gap-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs"
                  >
                    <Link href={`/me/prayer-requests/${p.id}/edit`}>
                      {t("edit")}
                    </Link>
                  </Button>
                  <CancelMyPrayerButton id={p.id} />
                </div>
              ) : null}
            </ExpressiveCard>
          ))}
        </div>
      )}
    </div>
  );
}
