import { ArrowLeft, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/giving">
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
          <Link href="/admin/giving/funds/new">
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
                      <div className="text-xs text-muted-foreground">
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
