import { Baby, Plus } from "lucide-react";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { ToggleClassActiveButton } from "@/components/admin/children/toggle-class-active-button";
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
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { listChildClasses } from "@/server/queries/children";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function ChildClassesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("children.classes");

  const result = await listChildClasses({ page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/children"
        backLabel={t("back")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/children/classes/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={Baby} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colAges")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">
                    {t("ageRange", { min: c.ageMin, max: c.ageMax })}
                  </TableCell>
                  <TableCell>
                    {c.isActive ? (
                      <Badge>{t("active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("inactive")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/children/classes/${c.id}/edit`}>
                          {t("edit")}
                        </Link>
                      </Button>
                      <ToggleClassActiveButton
                        id={c.id}
                        isActive={c.isActive}
                      />
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
