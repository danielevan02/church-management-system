import { HeartHandshake, Plus } from "lucide-react";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Link } from "@/lib/i18n/navigation";
import { parsePageParam } from "@/server/queries/_pagination";
import { listTeams } from "@/server/queries/volunteers";

export default async function TeamsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("volunteers.team.list");
  const result = await listTeams({ page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/volunteers"
        backLabel={t("backToList")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/volunteers/teams/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={HeartHandshake} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((tm) => (
            <ExpressiveCard key={tm.id} className="flex flex-col gap-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/volunteers/teams/${tm.id}`}
                  className="text-lg font-semibold tracking-tight hover:underline"
                >
                  {tm.name}
                </Link>
                <Badge variant={tm.isActive ? "default" : "secondary"}>
                  {tm.isActive ? t("statusActive") : t("statusInactive")}
                </Badge>
              </div>
              {tm.description ? (
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {tm.description}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-1">
                {tm.positions.length === 0 ? (
                  <span className="text-xs text-on-surface-variant">
                    {t("noPositions")}
                  </span>
                ) : (
                  tm.positions.map((p) => (
                    <Badge key={p.id} variant="outline" className="text-xs">
                      {p.name}
                    </Badge>
                  ))
                )}
              </div>
              <div className="text-xs text-on-surface-variant">
                {tm._count.assignments} {t("assignmentsAbbr")}
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
