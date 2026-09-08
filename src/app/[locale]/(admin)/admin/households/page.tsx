import { Home, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { HouseholdFilters } from "@/components/admin/households/household-filters";
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
  const qRaw = sp.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const t = await getTranslations("households");
  const tEyebrow = await getTranslations("eyebrow");
  const result = await listHouseholds({ page, q });
  const hasQuery = Boolean(q?.trim());

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("households")}
        title={t("list.title")}
        subtitle={t("list.subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/households/new">
              <Plus className="h-4 w-4" />
              {t("list.newButton")}
            </Link>
          </Button>
        }
      />

      <HouseholdFilters />

      {result.total === 0 ? (
        <EmptyState
          icon={Home}
          title={hasQuery ? t("list.emptySearch") : t("list.empty")}
        />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
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
                  <TableCell className="text-sm text-on-surface-variant">
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
