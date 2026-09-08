import { Plus, UsersRound } from "lucide-react";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { listCellGroups } from "@/server/queries/cell-groups";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function CellGroupsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const session = await auth();
  const role = session?.user.role;
  const t = await getTranslations("cellGroups.list");
  const tEyebrow = await getTranslations("eyebrow");

  const result = await listCellGroups({
    scope:
      role && session?.user
        ? { role, memberId: session.user.memberId ?? null }
        : undefined,
    page,
  });

  const canCreate = role === "ADMIN" || role === "STAFF";

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("cellGroups")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/cell-groups/new">
                <Plus className="h-4 w-4" />
                {t("newButton")}
              </Link>
            </Button>
          ) : null
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={UsersRound} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((g) => (
            <ExpressiveCard key={g.id} className="flex flex-col gap-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/cell-groups/${g.id}`}
                  className="text-lg font-semibold tracking-tight hover:underline"
                >
                  {g.name}
                </Link>
                <Badge variant={g.isActive ? "default" : "secondary"}>
                  {g.isActive ? t("statusActive") : t("statusInactive")}
                </Badge>
              </div>
              {g.description ? (
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {g.description}
                </p>
              ) : null}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {g.leader.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className="text-on-surface-variant">
                    {t("leaderLabel")}:
                  </span>{" "}
                  <span className="font-medium">{g.leader.fullName}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                {g.nextMeetingAt ? (
                  <span>
                    {t("nextMeetingPrefix")}{" "}
                    {formatJakarta(g.nextMeetingAt, "d MMM HH:mm")}
                  </span>
                ) : (
                  <span className="italic">{t("noNextMeeting")}</span>
                )}
                {g.nextMeetingLocation ? (
                  <span>· {g.nextMeetingLocation}</span>
                ) : null}
                <span className="ml-auto">
                  {g._count.members} {t("membersAbbr")}
                </span>
              </div>
            </ExpressiveCard>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
