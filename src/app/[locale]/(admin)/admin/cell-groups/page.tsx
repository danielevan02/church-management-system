import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { listCellGroups } from "@/server/queries/cell-groups";

export default async function CellGroupsListPage() {
  const session = await auth();
  const role = session?.user.role;
  const t = await getTranslations("cellGroups.list");
  const tDay = await getTranslations("cellGroups.day");

  const groups = await listCellGroups({
    scope:
      role && session?.user
        ? { role, memberId: session.user.memberId ?? null }
        : undefined,
  });

  const canCreate = role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: groups.length })}
          </p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/admin/cell-groups/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        ) : null}
      </header>

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
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
                  <p className="text-sm text-muted-foreground line-clamp-2">
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
                    <span className="text-muted-foreground">
                      {t("leaderLabel")}:
                    </span>{" "}
                    <span className="font-medium">{g.leader.fullName}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {g.meetingDay ? (
                    <span>{tDay(g.meetingDay as never)}</span>
                  ) : null}
                  {g.meetingTime ? <span>{g.meetingTime}</span> : null}
                  {g.meetingLocation ? <span>· {g.meetingLocation}</span> : null}
                  <span className="ml-auto">
                    {g._count.members} {t("membersAbbr")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
