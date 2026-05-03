import { BarChart3, Layers, Pencil, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { GivingFilters } from "@/components/admin/giving/giving-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { listAllFunds } from "@/server/queries/funds";
import {
  getGivingByWeek,
  type GivingFilters as Filters,
} from "@/server/queries/giving";

import type { ServiceType } from "@prisma/client";

const SERVICE_TYPE_VALUES: readonly ServiceType[] = [
  "SUNDAY_MORNING",
  "SUNDAY_EVENING",
  "MIDWEEK",
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
function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function GivingListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v ?? null;
  };

  const filters: Filters = {
    fundId: get("fundId") ?? undefined,
    serviceType: parseServiceType(get("serviceType")),
    from: parseDate(get("from")),
    to: parseDate(get("to")),
  };

  const t = await getTranslations("giving.list");
  const tServiceType = await getTranslations("services.type");

  const [funds, weeks] = await Promise.all([
    listAllFunds(),
    getGivingByWeek({ filters, weeks: 8 }),
  ]);

  const grandTotal = weeks.reduce((sum, w) => sum + w.total, 0);
  const grandCount = weeks.reduce((sum, w) => sum + w.entries.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", {
              total: grandCount,
              sum: formatRupiah(grandTotal),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/giving/funds">
              <Layers className="h-4 w-4" />
              {t("manageFunds")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/giving/reports">
              <BarChart3 className="h-4 w-4" />
              {t("reports")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/giving/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        </div>
      </header>

      <GivingFilters
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        current={{
          fundId: get("fundId") ?? undefined,
          serviceType: get("serviceType") ?? undefined,
          from: get("from") ?? undefined,
          to: get("to") ?? undefined,
        }}
      />

      {grandCount === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {weeks.map((week) => {
            const grouped = groupByService(week.entries);
            const isCurrentWeek = week === weeks[0];

            return (
              <Card key={week.weekStart.toISOString()}>
                <CardHeader>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {formatWeekRange(week.weekStart, week.weekEnd)}
                      </CardTitle>
                      {isCurrentWeek ? (
                        <Badge variant="outline" className="text-[10px]">
                          {t("currentWeek")}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("weekTotal")}:{" "}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatRupiah(week.total)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {week.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("weekEmpty")}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {grouped.map((g) => (
                        <div
                          key={g.key}
                          className="rounded-md border p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {g.kind === "service"
                                  ? g.serviceName
                                  : t("standalone")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {g.kind === "service" ? (
                                  <>
                                    {tServiceType(
                                      serviceTypeKey(g.serviceType),
                                    )}
                                    {" · "}
                                    {formatJakarta(
                                      g.serviceStartsAt,
                                      "EEE dd MMM yyyy, HH:mm",
                                    )}
                                  </>
                                ) : (
                                  t("standaloneSubtitle")
                                )}
                              </span>
                            </div>
                            <span className="font-semibold tabular-nums">
                              {formatRupiah(g.total)}
                            </span>
                          </div>
                          <ul className="flex flex-col gap-1.5 text-sm">
                            {g.entries.map((entry) => (
                              <li
                                key={entry.id}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {entry.fund.name}
                                  </Badge>
                                  {g.kind === "standalone" ? (
                                    <span className="text-xs text-muted-foreground">
                                      {formatJakarta(
                                        entry.receivedAt,
                                        "EEE dd MMM",
                                      )}
                                    </span>
                                  ) : null}
                                  {entry.notes ? (
                                    <span
                                      className="line-clamp-1 text-xs text-muted-foreground"
                                      title={entry.notes}
                                    >
                                      {entry.notes}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium tabular-nums">
                                    {formatRupiah(entry.amount)}
                                  </span>
                                  <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                  >
                                    <Link href={`/admin/giving/${entry.id}`}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Entry = Awaited<ReturnType<typeof getGivingByWeek>>[number]["entries"][number];

type Group =
  | {
      kind: "service";
      key: string;
      serviceId: string;
      serviceName: string;
      serviceType: ServiceType;
      serviceStartsAt: Date;
      total: number;
      entries: Entry[];
    }
  | {
      kind: "standalone";
      key: "_standalone";
      total: number;
      entries: Entry[];
    };

function groupByService(entries: Entry[]): Group[] {
  const services = new Map<string, Group & { kind: "service" }>();
  let standalone: (Group & { kind: "standalone" }) | null = null;

  for (const entry of entries) {
    const amount = Number(entry.amount.toString());
    if (entry.service) {
      const existing = services.get(entry.service.id);
      if (existing) {
        existing.entries.push(entry);
        existing.total += amount;
      } else {
        services.set(entry.service.id, {
          kind: "service",
          key: entry.service.id,
          serviceId: entry.service.id,
          serviceName: entry.service.name,
          serviceType: entry.service.type,
          serviceStartsAt: entry.service.startsAt,
          total: amount,
          entries: [entry],
        });
      }
    } else {
      if (!standalone) {
        standalone = {
          kind: "standalone",
          key: "_standalone",
          total: 0,
          entries: [],
        };
      }
      standalone.entries.push(entry);
      standalone.total += amount;
    }
  }

  const sortedServices = Array.from(services.values()).sort(
    (a, b) => b.serviceStartsAt.getTime() - a.serviceStartsAt.getTime(),
  );
  return standalone ? [...sortedServices, standalone] : sortedServices;
}

function formatWeekRange(start: Date, endExclusive: Date): string {
  const endInclusive = new Date(endExclusive);
  endInclusive.setDate(endInclusive.getDate() - 1);
  const sameMonth =
    start.getMonth() === endInclusive.getMonth() &&
    start.getFullYear() === endInclusive.getFullYear();
  if (sameMonth) {
    return `${formatJakarta(start, "dd")} – ${formatJakarta(endInclusive, "dd MMM yyyy")}`;
  }
  return `${formatJakarta(start, "dd MMM")} – ${formatJakarta(endInclusive, "dd MMM yyyy")}`;
}

function serviceTypeKey(t: ServiceType): string {
  switch (t) {
    case "SUNDAY_MORNING":
      return "sundayMorning";
    case "SUNDAY_EVENING":
      return "sundayEvening";
    case "MIDWEEK":
      return "midweek";
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
