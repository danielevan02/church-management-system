
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";
import { EmptyState } from "@/components/m3/empty-state";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";
import { listAuditLogs } from "@/server/queries/audit";
import { parsePageParam } from "@/server/queries/_pagination";
import { formatJakarta } from "@/lib/datetime";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const sp = await searchParams;
  const action = pickFirst(sp.action);
  const entityType = pickFirst(sp.entityType);
  const page = parsePageParam(sp.page);

  const t = await getTranslations("settings.audit");

  const result = await listAuditLogs({
    filters: {
      action: action || undefined,
      entityType: entityType || undefined,
    },
    page,
  });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/settings"
        backLabel={t("back")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
      />

      {result.items.length === 0 ? (
        <EmptyState icon={Settings} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colWhen")}</TableHead>
                <TableHead>{t("colActor")}</TableHead>
                <TableHead>{t("colAction")}</TableHead>
                <TableHead>{t("colEntity")}</TableHead>
                <TableHead>{t("colMetadata")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs tabular-nums text-on-surface-variant">
                    {formatJakarta(row.createdAt, "dd MMM yyyy, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.user?.username ?? (
                      <span className="text-on-surface-variant italic">
                        {t("system")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.entityType ? (
                      <>
                        <span className="font-medium">{row.entityType}</span>
                        {row.entityId ? (
                          <span className="ml-1 text-on-surface-variant">
                            #{row.entityId.slice(0, 8)}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    {row.metadata ? (
                      <code className="line-clamp-1 text-xs text-on-surface-variant">
                        {JSON.stringify(row.metadata)}
                      </code>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
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

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
