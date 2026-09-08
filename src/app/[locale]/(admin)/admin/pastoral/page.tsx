import { format } from "date-fns";
import { EmptyState } from "@/components/m3/empty-state";
import { HeartPulse, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { DeleteVisitButton } from "@/components/admin/pastoral/delete-visit-button";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPastoralVisits } from "@/server/queries/pastoral";
import { parsePageParam } from "@/server/queries/_pagination";
import { notFound } from "next/navigation";

export default async function PastoralListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!features.pastoralCare) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  // ADMIN/STAFF see all; LEADER limited to own group; MEMBER blocked at layout.
  const role = session.user.role;
  if (role === "MEMBER") notFound();

  const t = await getTranslations("pastoral.list");

  const tEyebrow = await getTranslations("eyebrow");
  const tType = await getTranslations("pastoral.visitType");

  let cellGroupIds: string[] | undefined;
  if (role === "LEADER") {
    if (!session.user.memberId) notFound();
    const groups = await prisma.cellGroup.findMany({
      where: { leaderId: session.user.memberId, deletedAt: null },
      select: { id: true },
    });
    cellGroupIds = groups.map((g) => g.id);
    if (cellGroupIds.length === 0) {
      // leader has no group — show empty
      cellGroupIds = ["__none__"];
    }
  }

  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const result = await listPastoralVisits({ filters: { cellGroupIds }, page });
  const canCreate = hasAtLeastRole(role, "LEADER");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("pastoral")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/pastoral/new">
                <Plus className="h-4 w-4" />
                {t("newButton")}
              </Link>
            </Button>
          ) : null
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={HeartPulse} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colMember")}</TableHead>
                <TableHead>{t("colType")}</TableHead>
                <TableHead>{t("colVisitedAt")}</TableHead>
                <TableHead>{t("colVisitedBy")}</TableHead>
                <TableHead>{t("colFollowUp")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {v.member.photoUrl ? (
                          <AvatarImage
                            src={v.member.photoUrl}
                            alt={v.member.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {v.member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/admin/members/${v.member.id}`}
                        className="font-medium hover:underline"
                      >
                        {v.member.fullName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tType(visitTypeKey(v.visitType))}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {format(v.visitedAt, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-xs text-on-surface-variant">
                    {v.visitedBy}
                  </TableCell>
                  <TableCell className="text-xs">
                    {v.followUpDate ? (
                      <Badge variant="outline">
                        {format(v.followUpDate, "dd MMM yyyy")}
                      </Badge>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/pastoral/${v.id}/edit`}>
                          {t("edit")}
                        </Link>
                      </Button>
                      {hasAtLeastRole(role, "ADMIN") ? (
                        <DeleteVisitButton id={v.id} />
                      ) : null}
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

function visitTypeKey(type: string): string {
  switch (type) {
    case "HOSPITAL":
      return "hospital";
    case "HOME":
      return "home";
    case "OFFICE":
      return "office";
    case "PHONE":
      return "phone";
    default:
      return "other";
  }
}
