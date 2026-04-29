import { ArrowLeft, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/volunteers">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/volunteers/teams/new">
            <Plus className="h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((tm) => (
            <Card key={tm.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
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
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tm.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1">
                  {tm.positions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
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
                <div className="text-xs text-muted-foreground">
                  {tm._count.assignments} {t("assignmentsAbbr")}
                </div>
              </CardContent>
            </Card>
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
