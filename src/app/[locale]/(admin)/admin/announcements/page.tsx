import { format } from "date-fns";
import { Megaphone, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Pagination } from "@/components/shared/pagination";
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
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { listAnnouncements } from "@/server/queries/announcements";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function AnnouncementsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("announcements.list");
  const result = await listAnnouncements({ page });
  const now = new Date();

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
          <Link href="/admin/announcements/new">
            <Plus className="h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colTitle")}</TableHead>
                <TableHead>{t("colPublishedAt")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("colAuthor")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((a) => {
                const isScheduled = a.publishedAt > now;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/admin/announcements/${a.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {a.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {a.body}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {format(a.publishedAt, "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell>
                      {isScheduled ? (
                        <Badge variant="outline">{t("statusScheduled")}</Badge>
                      ) : (
                        <Badge>{t("statusPublished")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.createdBy?.email ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
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
