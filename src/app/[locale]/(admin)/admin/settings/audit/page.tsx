import { ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { total: result.total })}
        </p>
      </header>

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
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
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {formatJakarta(row.createdAt, "dd MMM yyyy, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.user?.username ?? (
                      <span className="text-muted-foreground italic">
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
                          <span className="ml-1 text-muted-foreground">
                            #{row.entityId.slice(0, 8)}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    {row.metadata ? (
                      <code className="line-clamp-1 text-xs text-muted-foreground">
                        {JSON.stringify(row.metadata)}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
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
