import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
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
import { listHouseholds } from "@/server/queries/households";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function HouseholdsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("households");
  const result = await listHouseholds({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("list.subtitle", { total: result.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/households/new">
            <Plus className="h-4 w-4" />
            {t("list.newButton")}
          </Link>
        </Button>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
        </div>
      ) : (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("list.colName")}</TableHead>
                <TableHead>{t("list.colAddress")}</TableHead>
                <TableHead className="text-right">
                  {t("list.colMembers")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <Link
                      href={`/admin/households/${h.id}`}
                      className="font-medium hover:underline"
                    >
                      {h.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {h.address ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {h._count.members}
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
