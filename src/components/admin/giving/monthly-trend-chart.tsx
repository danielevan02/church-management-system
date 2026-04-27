"use client";

import { format, parse } from "date-fns";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatRupiah } from "@/lib/format";

type Row = { month: string; total: number };

export function MonthlyTrendChart({ data }: { data: Row[] }) {
  const t = useTranslations("giving.reports.chart");
  const config: ChartConfig = {
    total: { label: t("total"), color: "var(--chart-1)" },
  };

  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => format(parse(v, "yyyy-MM", new Date()), "MMM")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) =>
            new Intl.NumberFormat("id-ID", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(v))
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) =>
                format(parse(label as string, "yyyy-MM", new Date()), "MMMM yyyy")
              }
              formatter={(v) => formatRupiah(Number(v))}
            />
          }
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
