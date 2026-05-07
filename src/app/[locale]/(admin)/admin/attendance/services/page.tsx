import { CalendarRange, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ServiceFilters } from "@/components/admin/attendance/service-filters";
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
import { parsePageParam } from "@/server/queries/_pagination";
import {
  isServiceLive,
  listServices,
  type ServiceFilters as Filters,
} from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

import type { ServiceType } from "@prisma/client";

const SERVICE_TYPE_VALUES: readonly ServiceType[] = [
  "SUNDAY_SERVICE",
  "PRAYER_MEETING",
  "YOUTH",
  "CHILDREN",
  "SPECIAL",
  "OTHER",
];

function parseServiceType(v: string | null): ServiceType | undefined {
  return v && (SERVICE_TYPE_VALUES as readonly string[]).includes(v)
    ? (v as ServiceType)
    : undefined;
}

export default async function ServicesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);

  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v ?? null;
  };

  const statusParam = get("status");
  const liveFilter =
    statusParam === "active"
      ? true
      : statusParam === "inactive"
        ? false
        : undefined;

  const filters: Filters = {
    q: get("q") ?? undefined,
    type: parseServiceType(get("type")),
    live: liveFilter,
  };
  const isFiltered = Boolean(
    filters.q || filters.type || filters.live !== undefined,
  );

  const t = await getTranslations("services.list");
  const tType = await getTranslations("services.type");
  const result = await listServices({ filters, page });
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
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/attendance/services/recurring">
              <CalendarRange className="h-4 w-4" />
              {t("recurringButton")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/attendance/services/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        </div>
      </header>

      <ServiceFilters />

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {isFiltered ? t("emptyFiltered") : t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colType")}</TableHead>
                <TableHead>{t("colStartsAt")}</TableHead>
                <TableHead>{t("colAttendance")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((s) => {
                const live = isServiceLive(s, now);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/admin/attendance/services/${s.id}`}
                        className="font-medium hover:underline"
                      >
                        {s.name}
                      </Link>
                      {s.location ? (
                        <div className="text-xs text-muted-foreground">
                          {s.location}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">
                      {tType(typeKey(s.type))}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatJakarta(s.startsAt, "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {s._count.attendances}
                    </TableCell>
                    <TableCell>
                      <Badge variant={live ? "default" : "secondary"}>
                        {live ? t("statusActive") : t("statusInactive")}
                      </Badge>
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

function typeKey(t: string): string {
  switch (t) {
    case "SUNDAY_SERVICE":
      return "sundayService";
    case "PRAYER_MEETING":
      return "prayerMeeting";
    case "YOUTH":
      return "youth";
    case "CHILDREN":
      return "children";
    case "SPECIAL":
      return "special";
    default:
      return "other";
  }
}
