import { format } from "date-fns";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DeleteMilestoneButton } from "@/components/admin/discipleship/delete-milestone-button";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import { listMilestones } from "@/server/queries/discipleship";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function DiscipleshipListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("discipleship.list");
  const tType = await getTranslations("discipleship.type");

  const result = await listMilestones({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/discipleship/new">
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colMember")}</TableHead>
                <TableHead>{t("colType")}</TableHead>
                <TableHead>{t("colAchievedAt")}</TableHead>
                <TableHead>{t("colNotes")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {m.member.photoUrl ? (
                          <AvatarImage
                            src={m.member.photoUrl}
                            alt={m.member.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {m.member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/admin/members/${m.member.id}`}
                        className="font-medium hover:underline"
                      >
                        {m.member.fullName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tType(typeKey(m.type))}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {format(m.achievedAt, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground line-clamp-1">
                    {m.notes ?? ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/discipleship/${m.id}/edit`}>
                          {t("edit")}
                        </Link>
                      </Button>
                      <DeleteMilestoneButton id={m.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

function typeKey(type: string): string {
  switch (type) {
    case "DECISION_TO_FOLLOW":
      return "decisionToFollow";
    case "BAPTISM":
      return "baptism";
    case "MEMBERSHIP":
      return "membership";
    case "FOUNDATIONS_CLASS":
      return "foundationsClass";
    case "DISCIPLESHIP_CLASS":
      return "discipleshipClass";
    case "LEADERSHIP_TRAINING":
      return "leadershipTraining";
    case "CELL_GROUP_LEADER":
      return "cellGroupLeader";
    case "MISSION_TRIP":
      return "missionTrip";
    default:
      return "other";
  }
}
