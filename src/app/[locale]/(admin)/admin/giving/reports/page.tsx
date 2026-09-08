
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { MonthlyTrendChart } from "@/components/admin/giving/monthly-trend-chart";

import { auth } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/giving"
        backLabel={t("backToList")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        title={t("trendTitle")}
        description={t("trendDescription", { total: formatRupiah(trendTotal) })}
      >
        {trend.length === 0 || trendTotal === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("trendEmpty")}</p>
        ) : (
          <MonthlyTrendChart data={trend} />
        )}
      </BlockSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BlockSection
          title={t("breakdownByFundTitle")}
          description={t("breakdownDescription", { total: formatRupiah(fundTotal) })}
        >
          {fundBreakdown.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {t("breakdownEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {fundBreakdown.map((row) => (
                <li
                  key={row.fund?.id}
                  className="flex items-center justify-between rounded-2xl p-3 bg-surface-container-high"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{row.fund?.name}</span>
                    <span className="text-xs text-on-surface-variant">
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
        </BlockSection>

        <BlockSection
          title={t("breakdownByServiceTitle")}
          description={t("breakdownDescription", { total: formatRupiah(serviceTotal) })}
        >
          {serviceBreakdown.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {t("breakdownEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {serviceBreakdown.map((row) => (
                <li
                  key={row.type}
                  className="flex items-center justify-between rounded-2xl p-3 bg-surface-container-high"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {row.type === "STANDALONE"
                        ? tList("standalone")
                        : tServiceType(serviceTypeKey(row.type))}
                    </span>
                    <span className="text-xs text-on-surface-variant">
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
        </BlockSection>
      </div>
    </div>
  );
}

function serviceTypeKey(t: ServiceType): string {
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
