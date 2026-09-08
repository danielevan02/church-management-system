import { Megaphone, Plus } from "lucide-react";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
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
import { formatJakarta } from "@/lib/datetime";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { stripMarkdown } from "@/lib/markdown";
import { hasAtLeastRole } from "@/lib/permissions";
import { parsePageParam } from "@/server/queries/_pagination";
import { listAnnouncements } from "@/server/queries/announcements";

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
  const tEyebrow = await getTranslations("eyebrow");
  const result = await listAnnouncements({ page });
  const now = new Date();

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("announcements")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/announcements/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={Megaphone} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
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
                      <p className="line-clamp-1 text-xs text-on-surface-variant">
                        {stripMarkdown(a.body)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {formatJakarta(a.publishedAt, "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell>
                      {isScheduled ? (
                        <Badge variant="outline">{t("statusScheduled")}</Badge>
                      ) : (
                        <Badge>{t("statusPublished")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-on-surface-variant">
                      {a.createdBy?.username ?? "—"}
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
