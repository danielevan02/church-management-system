import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { MonthlyTrendChart } from "@/components/admin/giving/monthly-trend-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import {
  getFundBreakdown,
  getMonthlyGivingTrend,
  getServiceTypeBreakdown,
} from "@/server/queries/giving";

import type { ServiceType } from "@prisma/client";

export default async function GivingReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const t = await getTranslations("giving.reports");
  const tList = await getTranslations("giving.list");
  const tCategory = await getTranslations("giving.fund.category");
  const tServiceType = await getTranslations("services.type");

  const [trend, fundBreakdown, serviceBreakdown] = await Promise.all([
    getMonthlyGivingTrend(12),
    getFundBreakdown(),
    getServiceTypeBreakdown(),
  ]);

  const trendTotal = trend.reduce((acc, r) => acc + r.total, 0);
  const fundTotal = fundBreakdown.reduce((acc, r) => acc + r.total, 0);
  const serviceTotal = serviceBreakdown.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/giving">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("trendTitle")}</CardTitle>
          <CardDescription>
            {t("trendDescription", { total: formatRupiah(trendTotal) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 || trendTotal === 0 ? (
            <p className="text-sm text-muted-foreground">{t("trendEmpty")}</p>
          ) : (
            <MonthlyTrendChart data={trend} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("breakdownByFundTitle")}</CardTitle>
            <CardDescription>
              {t("breakdownDescription", { total: formatRupiah(fundTotal) })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fundBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("breakdownEmpty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {fundBreakdown.map((row) => (
                  <li
                    key={row.fund?.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{row.fund?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {row.fund
                          ? tCategory(row.fund.category.toLowerCase() as never)
                          : ""}{" "}
                        · {row.count} {t("recordsAbbr")}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatRupiah(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("breakdownByServiceTitle")}</CardTitle>
            <CardDescription>
              {t("breakdownDescription", { total: formatRupiah(serviceTotal) })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serviceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("breakdownEmpty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {serviceBreakdown.map((row) => (
                  <li
                    key={row.type}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {row.type === "STANDALONE"
                          ? tList("standalone")
                          : tServiceType(serviceTypeKey(row.type))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.count} {t("recordsAbbr")}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatRupiah(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
