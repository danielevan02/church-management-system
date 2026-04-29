import { format } from "date-fns";
import { Layers, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AssignmentRowActions } from "@/components/admin/volunteers/assignment-row-actions";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { parsePageParam } from "@/server/queries/_pagination";
import { listAssignments } from "@/server/queries/volunteers";

export default async function VolunteersHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("volunteers.schedule");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const result = await listAssignments({ upcomingOnly: true, page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/volunteers/teams">
              <Layers className="h-4 w-4" />
              {t("manageTeams")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/volunteers/assignments/new">
              <Plus className="h-4 w-4" />
              {t("newAssignment")}
            </Link>
          </Button>
        </div>
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
                <TableHead>{t("colDate")}</TableHead>
                <TableHead>{t("colTeam")}</TableHead>
                <TableHead>{t("colPosition")}</TableHead>
                <TableHead>{t("colMember")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm tabular-nums">
                    {format(a.serviceDate, "EEE dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm">{a.team.name}</TableCell>
                  <TableCell className="text-sm">
                    {a.position?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {a.member.photoUrl ? (
                          <AvatarImage
                            src={a.member.photoUrl}
                            alt={a.member.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {a.member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/admin/members/${a.member.id}`}
                        className="font-medium hover:underline"
                      >
                        {a.member.fullName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={a.status}
                      label={tStatus(statusKey(a.status))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AssignmentRowActions
                      id={a.id}
                      status={a.status as never}
                    />
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

function StatusBadge({ status, label }: { status: string; label: string }) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "CONFIRMED"
      ? "default"
      : status === "PENDING"
        ? "outline"
        : status === "DECLINED"
          ? "destructive"
          : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}

function statusKey(s: string): string {
  switch (s) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "DECLINED":
      return "declined";
    case "COMPLETED":
      return "completed";
    default:
      return s.toLowerCase();
  }
}
