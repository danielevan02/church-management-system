import { HandCoins, Plus } from "lucide-react";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";

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
import { Link } from "@/lib/i18n/navigation";
import { listFunds } from "@/server/queries/funds";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function FundsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("giving.fund.list");
  const tCategory = await getTranslations("giving.fund.category");
  const result = await listFunds({ page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/giving"
        backLabel={t("backToList")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/giving/funds/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={HandCoins} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colCategory")}</TableHead>
                <TableHead>{t("colRecords")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <span className="font-medium">{f.name}</span>
                    {f.description ? (
                      <div className="text-xs text-on-surface-variant">
                        {f.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tCategory(categoryKey(f.category))}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {f._count.entries}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.isActive ? "default" : "secondary"}>
                      {f.isActive ? t("statusActive") : t("statusInactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/giving/funds/${f.id}/edit`}>
                        {t("edit")}
                      </Link>
                    </Button>
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

function categoryKey(c: string): string {
  return c.toLowerCase();
}
