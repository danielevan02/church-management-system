import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { MonthlyTrendChart } from "@/components/admin/giving/monthly-trend-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { hasAtLeastRole } from "@/lib/permissions";
import {
  getFundBreakdown,
  getMonthlyGivingTrend,
  getTopGivers,
} from "@/server/queries/giving";

export default async function GivingReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const t = await getTranslations("giving.reports");
  const tCategory = await getTranslations("giving.fund.category");
  const canSeeTopGivers = hasAtLeastRole(session.user.role, "ADMIN");

  const [trend, breakdown, topGivers] = await Promise.all([
    getMonthlyGivingTrend(12),
    getFundBreakdown(),
    canSeeTopGivers ? getTopGivers({ limit: 10 }) : Promise.resolve([]),
  ]);

  const trendTotal = trend.reduce((acc, r) => acc + r.total, 0);
  const breakdownTotal = breakdown.reduce((acc, r) => acc + r.total, 0);

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
            <CardTitle>{t("breakdownTitle")}</CardTitle>
            <CardDescription>
              {t("breakdownDescription", { total: formatRupiah(breakdownTotal) })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("breakdownEmpty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {breakdown.map((row) => (
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

        {canSeeTopGivers ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("topGiversTitle")}</CardTitle>
              <CardDescription>{t("topGiversDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {topGivers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("topGiversEmpty")}
                </p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {topGivers.map((row, i) => (
                    <li
                      key={row.member?.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          #{i + 1}
                        </span>
                        <Avatar className="h-8 w-8">
                          {row.member?.photoUrl ? (
                            <AvatarImage
                              src={row.member.photoUrl}
                              alt={row.member.fullName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {row.member?.fullName.charAt(0).toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/members/${row.member?.id}`}
                            className="font-medium hover:underline"
                          >
                            {row.member?.fullName}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {row.count} {t("recordsAbbr")}
                          </span>
                        </div>
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
        ) : null}
      </div>
    </div>
  );
}
